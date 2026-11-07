const { use } = require('react');
const db = require('../config/db');

exports.getAllDrivers = async (req,res) =>{
    try{
        const [drivers] = await db.query(
            'SELECT id,name,code FROM drivers ORDER BY name ASC'
        );
        return res.status(200).jsoon({drivers});
    }catch(error){
        console.error('Error fetching driver list:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

exports.getTodayChallenge = async (req,res) => {
    try{
        const userId = req.user ? req.userId : null;
        const today = new Date().toISOString().split('T')[0];

        let [challenges] = await db.query(
            'SELECT * FROM daily_challenges WHERE challenge_date = ?',
            [today]
        );

        if (challenges.length === 0){
            const [allDrivers] = await db.query('SELECT id FROM drivers');
            if(allDrivers.length < 4){
                return res.status(400).json({
                    message: 'NOt enough drivers in database to create a daily challenge. Minimum 4 required.'
                });
            }
        

            const shuffled = [...allDrivers].sort(()=> 0.5 - Math.random());
            const readDriverId = shuffled[0].id;
            const rebusDriverId = shuffled[1].id;
            const zoomDriverId = shuffled[2].id;
            const teamDriverId = shuffled[3].id;

            await db.query(
                'INSERT INTO daily_challenges (challenge_date, read_driver_id, rebus_driver_id, zoom_driver_id, team_driver_id) VALUES (?,?,?,?,?)',
                [today,readDriverId,rebusDriverId,zoomDriverId,teamDriverId]
            );

            [challenges] = await db.query(
                'SELECT * FROM daily_challenges WHERE challenge_date = ?',
                [today]
            );
        }

        const currentChallenge = challenges[0];

        const[[readDriverData]] = await db.query(
            'SELECT clue_1, clue2, clue_3 FROM drivers WHERE id = ?',
            [currentChallenge.read_driver_id]
        );

        const [rebusElements] = await db.query(
            'SELECT element_order, type, content FROM driver_rebus WHERE driver_id = ? ORDER BY element_order ASC',
            [currentChallenge.rebus_driver_id]
        );

        const [[zoomDriverData]] = await db.query(
            'SELECT zoom_image_url FROM drivers WHERE id = ?',
            [currentChallenge.zoom_driver_id]
        );

        const [teamHistory] = await db.query(
            'SELECT dt.team_order, t.name AS team_name, t.logo_url FROM driver_teams dt JOIN teams t ON dt.team_id = t.id WHERE dt.driver_id = ? ORDER BY dt.team_order ASC',
            [currentChallenge.team_driver_id]
        );


        let userResult = null;
        if(userId){
            const [results] = await db.query(
                'SELECT * FROM user_daily_results WHERE user_id = ? AND challenge_date = ?',
                [userId, today]
            );
            if(results.length > 0){
                userResult = res[0];
            }
        }

        return res.status(200).json({
            challengeDate: today,
            userResult,
            games:{
                read:{
                    clues: readDriverData ? [readDriverData.clue_1, readDriverData.clue_2, readDriverData.clue_3] :[]
                },
                rebus :{
                    elements : rebusElements
                },
                zoom: {
                    imageUrl: zoomDriverData ? zoomDriverData.zoom_image_url : null
                },
                team: {
                    teams : teamHistory
                }
            }
        });
    }catch(error){
        console.error('Error fetching today challenge: ',error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

exports.validateGuess = async (req,res) => {
    try{
        const {gameType, guesseDriverId, attemptCount} = req.body;
        const today = new Date().toISOString.split('T')[0];

        if (!gameType || !guesseDriverId){
            return res.status(400).json({message : 'Missing required parameters'});
        }

        const [challenges] = await db.query(
            'Select * FROM daily_challenges WHERE challenge_date = ?',
            [today]
        );

        if (challenges.length === 0){
            return res.status(404).json({message: 'No active challenge found for today'});
        }

        const challenge = challenges[0];
        let targetDriverId = null;

        switch (gameType){
            case 'read':
                targetDriverId = challenge.read_driver_id;
                break;
            case 'rebus':
                targetDriverId = challenge.rebus_driver_id;
                break;
            case 'zoom':
                targetDriverId = challenge.zoom_driver_id;
                break;
            case 'team':
                targetDriverId = challenge.team_driver_id;
                break;
            default:
                return res.status(400).json({message: 'Invalid game type'});
        }

        const isCorrect = Number(guesseDriverId) === Number(targetDriverId);

        let score = 0;
        if(isCorrect){
            const attempts = attemptCount || 1;
            score = Math.max(0, 100-(attempts-1)*15);
        }

        let targetDriver = null;
        if(isCorrect){
            const [[driver]] = await db.query(
                'SELECT id, name, code, nattionality FROM drivers WHERE id = ?',
                [targetDriverId]
            );
            targetDriver = driver
        }

        return res.status(200).json({
            isCorrect,
            score,
            targetDriver
        })
    }catch(error){
        console.error('Error validating guess: ', error);
        return res.status(500).json({message : 'Internal server error'});
    }
};

exports.submitDetailyResults = async (req,res) => {
    try{
        const userId = req.user.id;
        const {readScore, rebusScore, zoomScore, teamScore} = req.body;
        const today = new Date().toISOString.split('T')[0];

        const totalScore = (readScore || 0) + (rebusScore || 0) +(zoomScore || 0) + (teamScore || 0);


        await db.query(
            'INSERT INTO user_daily_results (user_id, challenge_date, read_score, rebus_score, zoom_score, team_score, total_score, completed) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE) ON DUPLICATE KEY UPDATE read_score = VALUES(read_score), rebus_score = VALUES(rebus_score), zoom_score = VALUES(zoom_score), team_score = VALUES(team_score, total_score = VALUES(total_score), completed = TRUE',
            [userId, today, readScore || 0, rebusScore || 0, zoomScore || 0, teamScore || 0, totalScore]
        );

        const [stats] = await db.query('SELECT * FROM user_stats WHERE user_id = ?',[userId]);

        let gamesPlayed = 1;
        let bestScore = totalScore;
        let averageScore = totalScore;
        let currentStreak = 1;
        let maxStreak = 1;

        if (stats.length > 0){
            const userStat = stats[0];
            gamesPlayed = userStat.games_played +1;
            bestScore = Math.max(userStat.best_score, totalScore);
            averageScore = ((userStat.averageScore * userStat.games_played)+totalScore)/gamesPlayed;
            
            const lastPlayed = userStat.last_played_date ? new Date(userStat.last_played_date):null;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate()-1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const lastPlayedStr = lastPlayed ? lastPlayed.toISOString().split('T')[0]:null;

            if (lastPlayedStr === yesterdayStr){
                currentStreak = userStat.current_streak + 1;
            }else{
                currentStreak = 1;
            }

            maxStreak = Math.max(userStat.max_streak, currentStreak);

            await db.query(
                'UPDATE user_stats SET games_played = ?, best_score = ?, average_score = ?, current_streak = ?, max_streak = ?, last_played_date = ? WHERE user_id = ?',
                [gamesPlayed, bestScore, averageScore, currentStreak, maxStreak, today,userId]
            );
        }else{
            await db.query(
                'INSERT INTO user_stats (user_id, games_played, best_score, average_score, current_streak, max_streak, last_played_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, gamesPlayed, bestScore, averageScore, currentStreak, maxStreak, today]
            );
        }

        return res.status(200).json({
            message: 'Daily challenge completed successfully',
            summary: {
                totalScore,
                gamesPlayed,
                bestScore,
                averageScore: Number(averageScore.toFixed(1)),
                currentStreak,
                maxStreak
            }
        });
    }catch(error){
        console.error('Error submitting daily results: ', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};