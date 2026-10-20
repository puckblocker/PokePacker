DROP TABLE IF EXISTS orders, cart, item_review, listing, account;
DROP TYPE IF EXISTS order_status, account_status, account_type, condition, listing_status;

CREATE TYPE order_status AS ENUM
  ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

CREATE TYPE account_status AS ENUM
  ('approved', 'pending', 'denied', 'banned');

CREATE TYPE account_type AS ENUM
  ('buyer', 'seller', 'admin');

CREATE TYPE condition AS ENUM
  ('new', 'moderate', 'damaged');

CREATE TYPE listing_status AS ENUM
  ('active', 'pending', 'removed');

CREATE TABLE account (
    id            SERIAL PRIMARY KEY,
	username	  VARCHAR(15)		UNIQUE NOT NULL,
	password_hash VARCHAR(60)		UNIQUE NOT NULL,
	email		  VARCHAR(254)		NOT NULL,
	status        account_status    NOT NULL,
	type          account_type		NOT NULL
);

CREATE TABLE listing (
	id           SERIAL	PRIMARY KEY,
	seller_id	 INTEGER	    NOT NULL REFERENCES account(id),
    listing_name VARCHAR(100)   NOT NULL,
	quantity	 INTEGER 		NOT NULL,
	condition 	 condition	NOT NULL,
	price		 INTEGER		NOT NULL,
	image		 TEXT,
	description  VARCHAR(300),
	status       listing_status  NOT NULL
);

CREATE TABLE item_reviews (
	id 	            SERIAL  PRIMARY KEY,
    listing_id      INTEGER         NOT NULL    REFERENCES listing(id),
    reviewer_id     INTEGER         NOT NULL    REFERENCES account(id),
	description		VARCHAR(300) 	NOT NULL
);

CREATE TABLE cart (
    account_id      INTEGER     NOT NULL    REFERENCES account(id),
    listing_id      INTEGER     NOT NULL    REFERENCES listing(id),
	quantity 	    INTEGER		NOT NULL,
    PRIMARY KEY (account_id, listing_id)
);

CREATE TABLE orders (
    id      SERIAL PRIMARY KEY,
    account_id      INTEGER    NOT NULL     REFERENCES account(id),
    status      order_status   NOT NULL
);

