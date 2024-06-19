CREATE TABLE IF NOT EXISTS userinfo (
    userid VARCHAR(20),
    pass VARCHAR(20) NOT NULL,
    attempts INTEGER DEFAULT 0,
    locktill TIMESTAMPTZ
);

-- Insert initial data
INSERT INTO userinfo (userid, pass)
VALUES 
    ('user1', 'password1'),
    ('user2', 'password2');