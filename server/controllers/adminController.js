const db = require('../config/db');

const getToday = () => new Date().toISOString().split('T')[0];

// 1. Statistiques globales, Top 5, réponses du jour et liste des joueurs
exports.getAdminDashboard = async (req, res) => {
    try {
        const today = getToday();

        // Nombre total d'utilisateurs
        const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');

        // Moyenne des scores globaux (sur les parties complétées)
        const [[{ globalAverageScore }]] = await db.query(
            'SELECT COALESCE(AVG(total_score), 0) AS globalAverageScore FROM user_daily_results WHERE completed = TRUE'
        );

        // Top 5 utilisateurs (classés par score moyen puis meilleur score)
        const [topUsers] = await db.query(`
            SELECT u.id, u.username, u.email, 
                   ROUND(s.average_score, 1) AS average_score, 
                   s.best_score, s.games_played, s.current_streak
            FROM user_stats s
            JOIN users u ON s.user_id = u.id
            WHERE s.games_played > 0
            ORDER BY s.average_score DESC, s.best_score DESC
            LIMIT 5
        `);

        // Réponses des 4 mini-jeux du jour
        const [[todayChallenge]] = await db.query(
            'SELECT * FROM daily_challenges WHERE challenge_date = ?',
            [today]
        );

        let dailyAnswers = null;
        if (todayChallenge) {
            const [[readDriver]] = await db.query('SELECT id, name, code FROM drivers WHERE id = ?', [todayChallenge.read_driver_id]);
            const [[rebusDriver]] = await db.query('SELECT id, name, code FROM drivers WHERE id = ?', [todayChallenge.rebus_driver_id]);
            const [[zoomDriver]] = await db.query('SELECT id, name, code FROM drivers WHERE id = ?', [todayChallenge.zoom_driver_id]);
            const [[teamDriver]] = await db.query('SELECT id, name, code FROM drivers WHERE id = ?', [todayChallenge.team_driver_id]);

            dailyAnswers = {
                date: today,
                read: readDriver || null,
                rebus: rebusDriver || null,
                zoom: zoomDriver || null,
                team: teamDriver || null
            };
        }

        // Liste des utilisateurs avec leur statut de jeu du jour (pour les contrôles)
        const [users] = await db.query(`
            SELECT u.id, u.username, u.email, u.role, u.created_at,
                   s.games_played, ROUND(COALESCE(s.average_score, 0), 1) AS average_score,
                   COALESCE(r.completed, FALSE) AS played_today,
                   r.total_score AS today_score
            FROM users u
            LEFT JOIN user_stats s ON u.id = s.user_id
            LEFT JOIN user_daily_results r ON u.id = r.user_id AND r.challenge_date = ?
            ORDER BY u.created_at DESC
        `, [today]);

        return res.status(200).json({
            stats: {
                nbUsers: totalUsers,
                averageScore: Math.round(Number(globalAverageScore) * 10) / 10,
                top5Users: topUsers
            },
            dailyAnswers,
            users
        });
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Supprimer un utilisateur (et ses données liées)
exports.deleteUser = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const targetUserId = Number(req.params.id);

        if (targetUserId === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        await connection.beginTransaction();
        await connection.query('DELETE FROM user_daily_results WHERE user_id = ?', [targetUserId]);
        await connection.query('DELETE FROM user_stats WHERE user_id = ?', [targetUserId]);
        const [result] = await connection.query('DELETE FROM users WHERE id = ?', [targetUserId]);
        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};

// 3. Supprimer l'essai du jour d'un utilisateur et recalculer ses stats
exports.deleteUserDailyTry = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const targetUserId = Number(req.params.id);
        const today = getToday();

        await connection.beginTransaction();

        const [deleteResult] = await connection.query(
            'DELETE FROM user_daily_results WHERE user_id = ? AND challenge_date = ?',
            [targetUserId, today]
        );

        if (deleteResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'No daily try found for this user today.' });
        }

        // Recalculer user_stats à partir de l'historique restant
        const [remainingGames] = await connection.query(
            `SELECT total_score, DATE_FORMAT(challenge_date, '%Y-%m-%d') AS play_date
             FROM user_daily_results
             WHERE user_id = ? AND completed = TRUE
             ORDER BY challenge_date ASC`,
            [targetUserId]
        );

        if (remainingGames.length === 0) {
            await connection.query('DELETE FROM user_stats WHERE user_id = ?', [targetUserId]);
        } else {
            const gamesPlayed = remainingGames.length;
            const totalSum = remainingGames.reduce((acc, g) => acc + g.total_score, 0);
            const averageScore = totalSum / gamesPlayed;
            const bestScore = Math.max(...remainingGames.map(g => g.total_score));
            const lastPlayedDate = remainingGames[remainingGames.length - 1].play_date;

            // Recalcul des streaks
            let maxStreak = 1;
            let currentRun = 1;
            for (let i = 1; i < remainingGames.length; i++) {
                const prev = new Date(remainingGames[i - 1].play_date + 'T00:00:00Z');
                const curr = new Date(remainingGames[i].play_date + 'T00:00:00Z');
                const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
                if (diffDays === 1) {
                    currentRun++;
                    maxStreak = Math.max(maxStreak, currentRun);
                } else {
                    currentRun = 1;
                }
            }

            await connection.query(
                `UPDATE user_stats 
                 SET games_played = ?, best_score = ?, average_score = ?, 
                     current_streak = ?, max_streak = ?, last_played_date = ?
                 WHERE user_id = ?`,
                [gamesPlayed, bestScore, averageScore, currentRun, maxStreak, lastPlayedDate, targetUserId]
            );
        }

        await connection.commit();
        return res.status(200).json({ message: 'Daily try deleted and user stats recalculated.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting daily try:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};