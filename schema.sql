--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: ether_coinbases; Type: TABLE; Schema: public; Owner: vojtad
--

CREATE TABLE public.ether_coinbases (
    id integer NOT NULL,
    username character varying(20),
    address text,
    blockheight bigint,
    "timestamp" bigint,
    hash text,
    blockhash text,
    date bigint,
    amount bigint,
    usdvalue double precision
);


ALTER TABLE public.ether_coinbases OWNER TO vojtad;

--
-- Name: ether_coinbases_id_seq; Type: SEQUENCE; Schema: public; Owner: vojtad
--

CREATE SEQUENCE public.ether_coinbases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ether_coinbases_id_seq OWNER TO vojtad;

--
-- Name: ether_coinbases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vojtad
--

ALTER SEQUENCE public.ether_coinbases_id_seq OWNED BY public.ether_coinbases.id;


--
-- Name: payment_forms; Type: TABLE; Schema: public; Owner: vojtad
--

CREATE TABLE public.payment_forms (
    id integer NOT NULL,
    username text,
    address text,
    amount double precision,
    date bigint,
    finished integer,
    ethereum_address text
);


ALTER TABLE public.payment_forms OWNER TO vojtad;

--
-- Name: payment_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: vojtad
--

CREATE SEQUENCE public.payment_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_forms_id_seq OWNER TO vojtad;

--
-- Name: payment_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vojtad
--

ALTER SEQUENCE public.payment_forms_id_seq OWNED BY public.payment_forms.id;


--
-- Name: paypal_payment_forms; Type: TABLE; Schema: public; Owner: vojtad
--

CREATE TABLE public.paypal_payment_forms (
    id integer NOT NULL,
    username text,
    paypalemail text,
    date bigint,
    finished integer
);


ALTER TABLE public.paypal_payment_forms OWNER TO vojtad;

--
-- Name: paypal_payment_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: vojtad
--

CREATE SEQUENCE public.paypal_payment_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.paypal_payment_forms_id_seq OWNER TO vojtad;

--
-- Name: paypal_payment_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vojtad
--

ALTER SEQUENCE public.paypal_payment_forms_id_seq OWNED BY public.paypal_payment_forms.id;


--
-- Name: paypal_withdraw_forms; Type: TABLE; Schema: public; Owner: vojtad
--

CREATE TABLE public.paypal_withdraw_forms (
    id integer NOT NULL,
    username text,
    paypalemail text,
    amount text,
    date bigint,
    finished integer
);


ALTER TABLE public.paypal_withdraw_forms OWNER TO vojtad;

--
-- Name: paypal_withdraw_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: vojtad
--

CREATE SEQUENCE public.paypal_withdraw_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.paypal_withdraw_forms_id_seq OWNER TO vojtad;

--
-- Name: paypal_withdraw_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vojtad
--

ALTER SEQUENCE public.paypal_withdraw_forms_id_seq OWNED BY public.paypal_withdraw_forms.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: vojtad
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    public character varying(50) NOT NULL,
    private character varying(100) NOT NULL,
    password character varying(200) NOT NULL,
    date bigint
);


ALTER TABLE public.users OWNER TO vojtad;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: vojtad
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO vojtad;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vojtad
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: withdraw_forms; Type: TABLE; Schema: public; Owner: vojtad
--

CREATE TABLE public.withdraw_forms (
    id integer NOT NULL,
    username text,
    ethereumaddress text,
    amount text,
    date bigint,
    finished integer
);


ALTER TABLE public.withdraw_forms OWNER TO vojtad;

--
-- Name: withdraw_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: vojtad
--

CREATE SEQUENCE public.withdraw_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.withdraw_forms_id_seq OWNER TO vojtad;

--
-- Name: withdraw_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vojtad
--

ALTER SEQUENCE public.withdraw_forms_id_seq OWNED BY public.withdraw_forms.id;


--
-- Name: ether_coinbases id; Type: DEFAULT; Schema: public; Owner: vojtad
--

ALTER TABLE ONLY public.ether_coinbases ALTER COLUMN id SET DEFAULT nextval('public.ether_coinbases_id_seq'::regclass);


--
-- Name: payment_forms id; Type: DEFAULT; Schema: public; Owner: vojtad
--

ALTER TABLE ONLY public.payment_forms ALTER COLUMN id SET DEFAULT nextval('public.payment_forms_id_seq'::regclass);


--
-- Name: paypal_payment_forms id; Type: DEFAULT; Schema: public; Owner: vojtad
--

ALTER TABLE ONLY public.paypal_payment_forms ALTER COLUMN id SET DEFAULT nextval('public.paypal_payment_forms_id_seq'::regclass);


--
-- Name: paypal_withdraw_forms id; Type: DEFAULT; Schema: public; Owner: vojtad
--

ALTER TABLE ONLY public.paypal_withdraw_forms ALTER COLUMN id SET DEFAULT nextval('public.paypal_withdraw_forms_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: vojtad
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: withdraw_forms id; Type: DEFAULT; Schema: public; Owner: vojtad
--

ALTER TABLE ONLY public.withdraw_forms ALTER COLUMN id SET DEFAULT nextval('public.withdraw_forms_id_seq'::regclass);


--
-- Data for Name: ether_coinbases; Type: TABLE DATA; Schema: public; Owner: vojtad
--

COPY public.ether_coinbases (id, username, address, blockheight, "timestamp", hash, blockhash, date, amount, usdvalue) FROM stdin;
13	vojta	0x3041b61b1a5569d6859ce2aef64ee9b90581e593	6093052	1533477603	0xb64a901ef0b71033ee0033ba3b09569c6ac87fd20603daa39c25702b9ad0a504	0x10fd0e681a3e0f96cd2c0e9dcd3aaab0470a1a11eae6bb827ab3c799a3dce54e	1533490943645	9244000000000000	3.74000000000000021
\.


--
-- Data for Name: payment_forms; Type: TABLE DATA; Schema: public; Owner: vojtad
--

COPY public.payment_forms (id, username, address, amount, date, finished, ethereum_address) FROM stdin;
8	vojta	1MYupomntoz4r9sj54FEpWj4NMrQLq1b5x	1111	1533490717787	1	0x3041b61b1a5569d6859ce2aef64ee9b90581e593
9	vojta	1MYupomntoz4r9sj54FEpWj4NMrQLq1b5x	0.440000000000000002	1533589161728	0	0x46c27e9073d3aea1e68303b0e6c3ee79b4ccf515 
\.


--
-- Data for Name: paypal_payment_forms; Type: TABLE DATA; Schema: public; Owner: vojtad
--

COPY public.paypal_payment_forms (id, username, paypalemail, date, finished) FROM stdin;
1	vojta	vojta.drmota@hotmila.com	1533589114789	0
\.


--
-- Data for Name: paypal_withdraw_forms; Type: TABLE DATA; Schema: public; Owner: vojtad
--

COPY public.paypal_withdraw_forms (id, username, paypalemail, amount, date, finished) FROM stdin;
1	vojta	vojta.drmota@hotmail.com	99.9	1533590299943	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vojtad
--

COPY public.users (id, username, public, private, password, date) FROM stdin;
10	oracle	1Hr3FvfAyEVBcRtrW9cfhCJbFqWG7nRGUq	643746514138627453444f617977645832735a63443077734b335a7668575669	1234123412341234	\N
27	vojta	1MYupomntoz4r9sj54FEpWj4NMrQLq1b5x	7a31756f6371487159554859736b6b425550756a544445517430724169637a46	vojtadrmota	1533119574483
35	tomas	1Mkn3tnbBFY6LbTKEBjHnwtNhSEJpF6pGX	-	vojtadrmota	1533327129771
36	marketa	16D2gqVv3kqC2fwqdSWzQhwou7EYNK9rjp	-	vojtadrmota	1533327194748
\.


--
-- Data for Name: withdraw_forms; Type: TABLE DATA; Schema: public; Owner: vojtad
--

COPY public.withdraw_forms (id, username, ethereumaddress, amount, date, finished) FROM stdin;
1	vojta	0x46c27e9073d3aea1e68303b0e6c3ee79b4ccf515	100	1533590214664	0
\.


--
-- Name: ether_coinbases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vojtad
--

SELECT pg_catalog.setval('public.ether_coinbases_id_seq', 13, true);


--
-- Name: payment_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vojtad
--

SELECT pg_catalog.setval('public.payment_forms_id_seq', 9, true);


--
-- Name: paypal_payment_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vojtad
--

SELECT pg_catalog.setval('public.paypal_payment_forms_id_seq', 1, true);


--
-- Name: paypal_withdraw_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vojtad
--

SELECT pg_catalog.setval('public.paypal_withdraw_forms_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vojtad
--

SELECT pg_catalog.setval('public.users_id_seq', 37, true);


--
-- Name: withdraw_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vojtad
--

SELECT pg_catalog.setval('public.withdraw_forms_id_seq', 1, true);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vojtad
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

