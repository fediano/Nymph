const serverless = require('serverless-http');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

// Твои данные подключения
const supabase = createClient(
    'https://jcdhfxuehgpoyrdhxjgu.supabase.co', 
    'sb_publishable_EC2WEUD-MQHdkxR3svNKRA_AXrVffSi'
);

app.use(express.json());

// Авторизация (Вход и Регистрация)
app.post('/api/auth', async (req, res) => {
    const { type, username, password, avatar } = req.body;
    if (type === 'register') {
        const { error } = await supabase.from('users').insert([{ username, password, avatar }]);
        if (error) return res.status(400).json({ error: "Ник занят или ошибка базы" });
        res.json({ success: true, username, avatar });
    } else {
        const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single();
        if (error || !data) return res.status(401).json({ error: "Неверный логин или пароль" });
        res.json({ success: true, username: data.username, avatar: data.avatar });
    }
});

// Получение списка всех пользователей
app.get('/api/users', async (req, res) => {
    const { data } = await supabase.from('users').select('username, avatar');
    res.json(data || []);
});

// История сообщений
app.get('/api/messages', async (req, res) => {
    const { data } = await supabase.from('messages').select('*').order('id', { ascending: true });
    res.json(data || []);
});

// Отправка сообщения
app.post('/api/send', async (req, res) => {
    const { username, text, type, file, fileType } = req.body;
    const { error } = await supabase.from('messages').insert([{ 
        username, 
        text, 
        type, 
        file, 
        file_type: fileType 
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

module.exports = app;
module.exports.handler = serverless(app);
