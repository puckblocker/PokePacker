DROP TABLE IF EXISTS orders, cart, item_review, listing, account CASCADE;
DROP TYPE IF EXISTS order_status, account_status, account_type, condition, listing_status, review_status, ticket_status;

CREATE TYPE order_status AS ENUM
  ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

CREATE TYPE account_status AS ENUM
  ('approved', 'pending', 'denied', 'banned');

CREATE TYPE account_type AS ENUM
  ('buyer', 'seller', 'admin');

CREATE TYPE condition AS ENUM
  ('mint', 'moderate', 'damaged');

CREATE TYPE listing_status AS ENUM
  ('active', 'pending', 'removed');
  
CREATE TYPE review_status AS ENUM
  ('active', 'removed');

CREATE TYPE ticket_status AS ENUM
  ('open', 'closed');

CREATE TABLE account (
    id            SERIAL PRIMARY KEY,
	username	  VARCHAR(15)		UNIQUE NOT NULL,
	password_hash VARCHAR(60)		UNIQUE NOT NULL,
	email		  VARCHAR(254)		NOT NULL,
	status        account_status    NOT NULL,
	type          account_type		NOT NULL,
	denial_reason text
);

CREATE TABLE listing (
	id           SERIAL	PRIMARY KEY,
	seller_id	 INTEGER	    NOT NULL REFERENCES account(id),
    listing_name VARCHAR(100)   NOT NULL,
	quantity	 INTEGER 		NOT NULL,
	condition 	 condition		NOT NULL,
	price		 INTEGER		NOT NULL,
	image		 TEXT,
	description  VARCHAR(300),
	status       listing_status  NOT NULL
);

CREATE TABLE item_review (
	id 	            SERIAL  PRIMARY KEY,
    listing_id      INTEGER         NOT NULL    REFERENCES listing(id),
    reviewer_id     INTEGER         NOT NULL    REFERENCES account(id),
	description		VARCHAR(300) 	NOT NULL,
    status       review_status  NOT NULL,
    rating          INTEGER         NOT NULL CHECK (rating >= 1 AND rating <= 5)
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
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      order_status   NOT NULL
);

CREATE TABLE order_items (
    id           SERIAL PRIMARY KEY,
    order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id   INTEGER NOT NULL REFERENCES listing(id),
    listing_name VARCHAR(100) NOT NULL,
    quantity     INTEGER NOT NULL,
    price        NUMERIC(10,2) NOT NULL
);

CREATE TABLE refund_requests (
    id           SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_items(id),
    buyer_id     INTEGER NOT NULL REFERENCES account(id),
    seller_id    INTEGER NOT NULL REFERENCES account(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
    id           SERIAL PRIMARY KEY,
    account_id   INTEGER NOT NULL REFERENCES account(id),
    subject      VARCHAR(100) NOT NULL,
    description  VARCHAR(300) NOT NULL,
    status       ticket_status NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seller_requests (
    id          SERIAL PRIMARY KEY,
    account_id  INTEGER NOT NULL REFERENCES account(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);
