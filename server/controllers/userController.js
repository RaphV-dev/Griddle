const db = require('../config/db');
const bcrypt = require('bcrypt');

const MIN_PASSWORD_LENGTH = 8;

const getToday = () => new Date().toISOString().split('T')[0];

const getYesterday = () => {
    const d = new Date(getToday() + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
};  

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getToday();
        const yesterday = getYesterday();

        const [[user]] = await db.query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const [[stats]] = await db.query(
            `SELECT games_played, best_score, average_score, current_streak, max_streak,
                    DATE_FORMAT(last_played_date, '%Y-%m-%d') AS last_played_date
             FROM user_stats WHERE user_id = ?`,
            [userId]
        );

        const [[todayResult]] = await db.query(
            `SELECT read_score, rebus_score, zoom_score, team_score, total_score, completed
             FROM user_daily_results WHERE user_id = ? AND challenge_date = ?`,
            [userId, today]
        );

        const played = Boolean(todayResult && todayResult.completed);

        // La streak stockée n'est valide que si la dernière partie date d'aujourd'hui ou d'hier
        const streakIsAlive = stats && (stats.last_played_date === today || stats.last_played_date === yesterday);

        return res.status(200).json({
            today: {
                date: today,
                played,
                scores: played ? {
                    read: todayResult.read_score,
                    rebus: todayResult.rebus_score,
                    zoom: todayResult.zoom_score,
                    team: todayResult.team_score,
                    total: todayResult.total_score
                } : null
            },
            stats: {
                currentStreak: streakIsAlive ? stats.current_streak : 0,
                bestStreak: stats ? stats.max_streak : 0,
                bestScore: stats ? stats.best_score : 0,
                averageScore: stats ? Math.round(Number(stats.average_score) * 10) / 10 : 0,
                gamesPlayed: stats ? stats.games_played : 0
            },
            account: {
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please fill up current and new password.' });
        }

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
        }

        const [[user]] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            // 400 et non 401/403, pour ne pas déclencher un éventuel logout automatique côté front
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from the current one.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        return res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error changing password: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};