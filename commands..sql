CREATE TABLE blogs (
id SERIAL PRIMARY KEY,
author TEXT,
url TEXT NOT NULL,
title TEXT NOT NULL,
likes integer DEFAULT 0
);

insert into blogs (author, url, title) values ('Dan Abramov', 'danabramov.com', 'Writing resilient components'), ('Martin Fowler', 'martinfowler.com', 'Is high quality software worth the cost');
