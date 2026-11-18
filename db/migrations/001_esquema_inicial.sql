--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2026-11-18 08:32:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4919 (class 1262 OID 16398)
-- Name: juegoslink; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE juegoslink WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Argentina.1252';


ALTER DATABASE juegoslink OWNER TO postgres;

\connect juegoslink

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16554)
-- Name: actividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividad (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(40) NOT NULL,
    juego_id integer,
    coleccion_id integer,
    detalle jsonb,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT actividad_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['juego_agregado'::character varying, 'juego_quitado'::character varying, 'estado_cambiado'::character varying, 'favorito_agregado'::character varying, 'favorito_quitado'::character varying, 'juego_puntuado'::character varying, 'resena_creada'::character varying, 'resena_editada'::character varying, 'coleccion_creada'::character varying, 'coleccion_borrada'::character varying, 'juego_agregado_a_coleccion'::character varying, 'juego_quitado_de_coleccion'::character varying, 'perfil_editado'::character varying])::text[])))
);


ALTER TABLE public.actividad OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16553)
-- Name: actividad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actividad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actividad_id_seq OWNER TO postgres;

--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 229
-- Name: actividad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actividad_id_seq OWNED BY public.actividad.id;


--
-- TOC entry 221 (class 1259 OID 16439)
-- Name: biblioteca; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biblioteca (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    juego_id integer NOT NULL,
    estado character varying(20) DEFAULT 'quiero_jugar'::character varying NOT NULL,
    horas_jugadas numeric(7,1) DEFAULT 0 NOT NULL,
    terminado_en timestamp with time zone,
    agregado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT biblioteca_estado_check CHECK (((estado)::text = ANY ((ARRAY['quiero_jugar'::character varying, 'jugando'::character varying, 'terminado'::character varying, 'abandonado'::character varying])::text[]))),
    CONSTRAINT biblioteca_horas_jugadas_check CHECK ((horas_jugadas >= (0)::numeric))
);


ALTER TABLE public.biblioteca OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16438)
-- Name: biblioteca_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.biblioteca_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.biblioteca_id_seq OWNER TO postgres;

--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 220
-- Name: biblioteca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.biblioteca_id_seq OWNED BY public.biblioteca.id;


--
-- TOC entry 228 (class 1259 OID 16537)
-- Name: coleccion_juegos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coleccion_juegos (
    coleccion_id integer NOT NULL,
    juego_id integer NOT NULL,
    agregado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coleccion_juegos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16522)
-- Name: colecciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colecciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(80) NOT NULL,
    descripcion character varying(300),
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.colecciones OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16521)
-- Name: colecciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.colecciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.colecciones_id_seq OWNER TO postgres;

--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 226
-- Name: colecciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.colecciones_id_seq OWNED BY public.colecciones.id;


--
-- TOC entry 222 (class 1259 OID 16463)
-- Name: favoritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favoritos (
    usuario_id integer NOT NULL,
    juego_id integer NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favoritos OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16425)
-- Name: juegos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.juegos (
    id integer NOT NULL,
    id_externo integer NOT NULL,
    titulo character varying(200) NOT NULL,
    portada_url text,
    fecha_lanzamiento date,
    generos text[] DEFAULT '{}'::text[] NOT NULL,
    plataformas text[] DEFAULT '{}'::text[] NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.juegos OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16424)
-- Name: juegos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.juegos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.juegos_id_seq OWNER TO postgres;

--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 218
-- Name: juegos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.juegos_id_seq OWNED BY public.juegos.id;


--
-- TOC entry 223 (class 1259 OID 16479)
-- Name: puntuaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puntuaciones (
    usuario_id integer NOT NULL,
    juego_id integer NOT NULL,
    puntaje smallint NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT puntuaciones_puntaje_check CHECK (((puntaje >= 1) AND (puntaje <= 5)))
);


ALTER TABLE public.puntuaciones OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16498)
-- Name: resenas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resenas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    juego_id integer NOT NULL,
    texto text NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT resenas_texto_check CHECK (((char_length(texto) >= 1) AND (char_length(texto) <= 500)))
);


ALTER TABLE public.resenas OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16497)
-- Name: resenas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resenas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resenas_id_seq OWNER TO postgres;

--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 224
-- Name: resenas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resenas_id_seq OWNED BY public.resenas.id;


--
-- TOC entry 217 (class 1259 OID 16414)
-- Name: usuario_generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_generos (
    usuario_id integer NOT NULL,
    genero character varying(60) NOT NULL
);


ALTER TABLE public.usuario_generos OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16400)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre_usuario character varying(30) NOT NULL,
    email character varying(255) NOT NULL,
    contrasena_hash text NOT NULL,
    nombre character varying(60),
    avatar_url text,
    bio character varying(300),
    plataforma_preferida character varying(40),
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16399)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 215
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4697 (class 2604 OID 16557)
-- Name: actividad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad ALTER COLUMN id SET DEFAULT nextval('public.actividad_id_seq'::regclass);


--
-- TOC entry 4682 (class 2604 OID 16442)
-- Name: biblioteca id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca ALTER COLUMN id SET DEFAULT nextval('public.biblioteca_id_seq'::regclass);


--
-- TOC entry 4693 (class 2604 OID 16525)
-- Name: colecciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones ALTER COLUMN id SET DEFAULT nextval('public.colecciones_id_seq'::regclass);


--
-- TOC entry 4678 (class 2604 OID 16428)
-- Name: juegos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.juegos ALTER COLUMN id SET DEFAULT nextval('public.juegos_id_seq'::regclass);


--
-- TOC entry 4690 (class 2604 OID 16501)
-- Name: resenas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas ALTER COLUMN id SET DEFAULT nextval('public.resenas_id_seq'::regclass);


--
-- TOC entry 4675 (class 2604 OID 16403)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4913 (class 0 OID 16554)
-- Dependencies: 230
-- Data for Name: actividad; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4904 (class 0 OID 16439)
-- Dependencies: 221
-- Data for Name: biblioteca; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4911 (class 0 OID 16537)
-- Dependencies: 228
-- Data for Name: coleccion_juegos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4910 (class 0 OID 16522)
-- Dependencies: 227
-- Data for Name: colecciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4905 (class 0 OID 16463)
-- Dependencies: 222
-- Data for Name: favoritos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4902 (class 0 OID 16425)
-- Dependencies: 219
-- Data for Name: juegos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4906 (class 0 OID 16479)
-- Dependencies: 223
-- Data for Name: puntuaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4908 (class 0 OID 16498)
-- Dependencies: 225
-- Data for Name: resenas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4900 (class 0 OID 16414)
-- Dependencies: 217
-- Data for Name: usuario_generos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4899 (class 0 OID 16400)
-- Dependencies: 216
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 229
-- Name: actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actividad_id_seq', 1, false);


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 220
-- Name: biblioteca_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biblioteca_id_seq', 1, false);


--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 226
-- Name: colecciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colecciones_id_seq', 1, false);


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 218
-- Name: juegos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.juegos_id_seq', 1, false);


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 224
-- Name: resenas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resenas_id_seq', 1, false);


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 215
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- TOC entry 4738 (class 2606 OID 16563)
-- Name: actividad actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_pkey PRIMARY KEY (id);


--
-- TOC entry 4717 (class 2606 OID 16450)
-- Name: biblioteca biblioteca_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_pkey PRIMARY KEY (id);


--
-- TOC entry 4719 (class 2606 OID 16452)
-- Name: biblioteca biblioteca_usuario_id_juego_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_usuario_id_juego_id_key UNIQUE (usuario_id, juego_id);


--
-- TOC entry 4736 (class 2606 OID 16542)
-- Name: coleccion_juegos coleccion_juegos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coleccion_juegos
    ADD CONSTRAINT coleccion_juegos_pkey PRIMARY KEY (coleccion_id, juego_id);


--
-- TOC entry 4731 (class 2606 OID 16529)
-- Name: colecciones colecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2606 OID 16531)
-- Name: colecciones colecciones_usuario_id_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_usuario_id_nombre_key UNIQUE (usuario_id, nombre);


--
-- TOC entry 4722 (class 2606 OID 16468)
-- Name: favoritos favoritos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_pkey PRIMARY KEY (usuario_id, juego_id);


--
-- TOC entry 4713 (class 2606 OID 16437)
-- Name: juegos juegos_id_externo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.juegos
    ADD CONSTRAINT juegos_id_externo_key UNIQUE (id_externo);


--
-- TOC entry 4715 (class 2606 OID 16435)
-- Name: juegos juegos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.juegos
    ADD CONSTRAINT juegos_pkey PRIMARY KEY (id);


--
-- TOC entry 4724 (class 2606 OID 16486)
-- Name: puntuaciones puntuaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_pkey PRIMARY KEY (usuario_id, juego_id);


--
-- TOC entry 4727 (class 2606 OID 16508)
-- Name: resenas resenas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_pkey PRIMARY KEY (id);


--
-- TOC entry 4729 (class 2606 OID 16510)
-- Name: resenas resenas_usuario_id_juego_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_usuario_id_juego_id_key UNIQUE (usuario_id, juego_id);


--
-- TOC entry 4711 (class 2606 OID 16418)
-- Name: usuario_generos usuario_generos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_generos
    ADD CONSTRAINT usuario_generos_pkey PRIMARY KEY (usuario_id, genero);


--
-- TOC entry 4705 (class 2606 OID 16413)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4707 (class 2606 OID 16411)
-- Name: usuarios usuarios_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);


--
-- TOC entry 4709 (class 2606 OID 16409)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4739 (class 1259 OID 16582)
-- Name: idx_actividad_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividad_usuario ON public.actividad USING btree (usuario_id, creado_en DESC);


--
-- TOC entry 4720 (class 1259 OID 16579)
-- Name: idx_biblioteca_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_biblioteca_usuario ON public.biblioteca USING btree (usuario_id);


--
-- TOC entry 4734 (class 1259 OID 16581)
-- Name: idx_colecciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_colecciones_usuario ON public.colecciones USING btree (usuario_id);


--
-- TOC entry 4725 (class 1259 OID 16580)
-- Name: idx_resenas_juego; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resenas_juego ON public.resenas USING btree (juego_id);


--
-- TOC entry 4752 (class 2606 OID 16574)
-- Name: actividad actividad_coleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON DELETE SET NULL;


--
-- TOC entry 4753 (class 2606 OID 16569)
-- Name: actividad actividad_juego_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_juego_id_fkey FOREIGN KEY (juego_id) REFERENCES public.juegos(id) ON DELETE SET NULL;


--
-- TOC entry 4754 (class 2606 OID 16564)
-- Name: actividad actividad_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4741 (class 2606 OID 16458)
-- Name: biblioteca biblioteca_juego_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_juego_id_fkey FOREIGN KEY (juego_id) REFERENCES public.juegos(id) ON DELETE CASCADE;


--
-- TOC entry 4742 (class 2606 OID 16453)
-- Name: biblioteca biblioteca_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4750 (class 2606 OID 16543)
-- Name: coleccion_juegos coleccion_juegos_coleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coleccion_juegos
    ADD CONSTRAINT coleccion_juegos_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON DELETE CASCADE;


--
-- TOC entry 4751 (class 2606 OID 16548)
-- Name: coleccion_juegos coleccion_juegos_juego_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coleccion_juegos
    ADD CONSTRAINT coleccion_juegos_juego_id_fkey FOREIGN KEY (juego_id) REFERENCES public.juegos(id) ON DELETE CASCADE;


--
-- TOC entry 4749 (class 2606 OID 16532)
-- Name: colecciones colecciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4743 (class 2606 OID 16474)
-- Name: favoritos favoritos_juego_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_juego_id_fkey FOREIGN KEY (juego_id) REFERENCES public.juegos(id) ON DELETE CASCADE;


--
-- TOC entry 4744 (class 2606 OID 16469)
-- Name: favoritos favoritos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4745 (class 2606 OID 16492)
-- Name: puntuaciones puntuaciones_juego_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_juego_id_fkey FOREIGN KEY (juego_id) REFERENCES public.juegos(id) ON DELETE CASCADE;


--
-- TOC entry 4746 (class 2606 OID 16487)
-- Name: puntuaciones puntuaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4747 (class 2606 OID 16516)
-- Name: resenas resenas_juego_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_juego_id_fkey FOREIGN KEY (juego_id) REFERENCES public.juegos(id) ON DELETE CASCADE;


--
-- TOC entry 4748 (class 2606 OID 16511)
-- Name: resenas resenas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4740 (class 2606 OID 16419)
-- Name: usuario_generos usuario_generos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_generos
    ADD CONSTRAINT usuario_generos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


-- Completed on 2026-11-18 08:32:37

--
-- PostgreSQL database dump complete
--

