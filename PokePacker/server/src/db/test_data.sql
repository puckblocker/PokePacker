---
--- one admin
--- 3 to 5 buyers
--- 3 to 5 sellers
--- 10 products
---

INSERT INTO account (username, password_hash, email, status, type)
SELECT u.username,
       '$2b$10$' || left(md5(u.username || 'a') || md5(u.username || 'b'), 53),
       u.email, u.status::account_status, u.type::account_type
FROM (VALUES
    ('admin_poke',     'poke@example.com',         'approved', 'admin'),
    ('seller_mads',    'madison@example.com',      'approved', 'seller'),
    ('seller_nath',    'nath@example.com',         'approved', 'seller'),
    ('seller_bray',    'brayden@example.com',      'approved', 'seller'),
    ('seller_seth',    'seth@example.com',         'pending',  'seller'),
    ('seller_snorlax', 'snorlax@example.com',      'denied',   'seller'),
    ('charizardfan1',  'charizardfan@example.com', 'approved', 'buyer'),
    ('iluvpikachu',    'pikachufan@example.com',   'approved', 'buyer'),
    ('eeveeiscute',    'eeveefan@example.com',     'pending',  'buyer'),
    ('mewtwoisbest',   'mewtwofan@example.com',    'banned',   'buyer')
    )AS u(username, email, status, type);

INSERT INTO listing (seller_id, listing_name, quantity, condition, price, image, description, status)
VALUES (2, 'Eevee - 116/128 (30th Celebration) (Cosmos)', 1, 'moderate',   2400, '/tests/img_src/eevee_1.jpg',   'SUPER DETAILED DESCRIPTION', 'active'),
       (2, 'Psyduck - 226/217',                           1, 'moderate',   3585, '/tests/img_src/psyduck.jpg',   'SUPER DETAILED DESCRIPTION', 'active'),
       (2, 'Bulbasaur - 133/132',                         1, 'moderate',   1563, '/tests/img_src/bulbasaur.jpg',   'SUPER DETAILED DESCRIPTION', 'pending'),
       (3, 'Wigglypuff - 105/094',                        1, 'moderate',   470,  '/tests/img_src/wigglypuff.jpg', 'SUPER DETAILED DESCRIPTION', 'active'),
       (3, 'Maushold - 146/128',                          1, 'mint',       1092, '/tests/img_src/maushold.jpg',   'SUPER DETAILED DESCRIPTION', 'removed'),
       (3, 'Mega Kangaskhan ex - 104/132',                1, 'mint',       284,  '/tests/img_src/mega_kangaskhan.jpg', 'SUPER DETAILED DESCRIPTION', 'active'),
       (3, 'Pikachu ex - 054/128',                        1, 'damaged',    124,  '/tests/img_src/pikachu_ex.jpg',       'SUPER DETAILED DESCRIPTION', 'active'),
       (4, 'Kommo-o - 143/128',                           1, 'mint',       140,  '/tests/img_src/kommo.jpg',            'SUPER DETAILED DESCRIPTION', 'pending'),
       (4, 'Jirachi ex - 102/128',                        1, 'mint',       48,   '/tests/img_src/jirachi.jpg',          'SUPER DETAILED DESCRIPTION', 'active'),
       (4, 'Meowth ex - 062/088',                         1, 'damaged',    156,  '/tests/img_src/meowth_ex.jpg',        'SUPER DETAILED DESCRIPTION', 'removed');
    
INSERT INTO cart (account_id, listing_id, quantity)
VALUES  (7, 4, 1),
        (7, 9, 1),
        (8, 1, 1),
        (8, 6, 1),
        (9, 2, 1);

INSERT INTO orders (account_id, status) 
VALUES (7, 'delivered'),
       (7, 'paid'),
       (7, 'pending'),
       (8, 'shipped'),
       (8, 'pending'),
       (9, 'cancelled');