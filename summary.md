# Projekt: PassOwl (pracovní název)

## I. Cíl Projektu (Core Idea):
Vytvořit bezpečnou aplikaci pro správu hesel sestávající z:
1.  **Backendového API:** Pro ukládání dat, logiku a správu rolí.
2.  **Webového Frontendu:** Pro uživatelskou interakci, správu hesel, bezpečných poznámek, kategorií, profilu, *budoucí sdílení hesel* a administrátorské funkce.
3.  **(Budoucí rozšíření) Java Desktopové Aplikace:** Pro offline přístup a správu.
Důraz je kladen na **bezpečnost (primárně client-side end-to-end šifrování - E2EE princip)**, rychlý vývoj, použití plnohodnotné databáze (**PostgreSQL**) a splnění specifických projektových požadavků (role, počet tabulek, typy obsahu, obrázky, browser storage).

## II. Architektura a Bezpečnostní Model (Klíčové):

*   **Role Uživatelů:**
    *   **Běžný uživatel (User):** Spravuje svá hesla, bezpečné poznámky, kategorie, profil, (budoucí) sdílení.
    *   **Administrátor (Admin):** Může spravovat uživatele (vidět seznam, role), prohlížet audit logy. **Nesmí** mít přístup k dešifrovaným datům uživatelů (hesla, poznámky) ani k jejich Master Heslům.
*   **Client-Side Encryption (Princip E2EE):**
    *   **Master Heslo:** Zvoleno uživatelem, **NIKDY** neopouští klientské zařízení (prohlížeč/Java app) v čitelné podobě.
    *   **Klíčové Derivační Funkce (KDF):** **Argon2id** (preferované) nebo PBKDF2.
        *   **Pro Login:** Klient generuje `login_salt`. `login_hash = KDF(Master Heslo, login_salt)`. Tento `login_hash` a `login_salt` se ukládají na serveru.
        *   **Pro Šifrování Dat (Hesla, Bezpečné Poznámky):** Klient generuje `encryption_salt` (ukládá se na serveru). `encryption_key = KDF(Master Heslo, encryption_salt)`. Tento klíč se drží pouze v paměti klienta po dobu sezení.
    *   **Šifrování Dat:** **AES-256-GCM** na klientovi. Každý záznam hesla/poznámky je šifrován pomocí `encryption_key` a unikátního `IV` (Initialization Vector). Server ukládá pouze zašifrované bloby a `IV`.
*   **Autentizace Uživatele:**
    *   Přihlášení pomocí `username` a `login_hash` vypočítaného na klientovi. Server ověří a vydá **JWT (JSON Web Token)**, který může obsahovat i informaci o roli.
*   **(Budoucí) Sdílení Hesel (Web Aplikace):**
    *   Pomocí **asymetrické kryptografie (RSA nebo ECC)**. Každý uživatel bude mít pár veřejný/privátní klíč. Privátní klíč bude zašifrován Master Heslem uživatele. Při sdílení se heslo dešifruje na klientovi odesílatele a zašifruje veřejným klíčem příjemce.

## III. Technologický Stack (MVP - Backend + Web Frontend):

1.  **Backend (API):**
    *   **Jazyk/Framework:** **Python + FastAPI** (pro rychlý vývoj, automatickou validaci a generování dokumentace).
    *   **ORM:** **SQLAlchemy** (pro interakci s databází, s **Alembic** pro databázové migrace).
    *   **Autentizace/Autorizace:** JWT (knihovna `python-jose` pro tvorbu a validaci tokenů), role-based access control implementovaný pomocí FastAPI dependencies.
    *   **Databáze:** **Managed PostgreSQL (Neon.tech)** (serverless Postgres, škálovatelný, s dobrou free vrstvou).
    *   **Web Server/ASGI:** **Uvicorn** (pro vývoj a produkci) + Gunicorn (jako procesní manažer v produkci pro lepší škálovatelnost a odolnost).

2.  **Frontend (Web Aplikace):**
    *   **Framework:** **SvelteKit** (pro moderní, reaktivní a rychlé uživatelské rozhraní).
    *   **HTTP Klient:** Vestavěný `fetch` API ve SvelteKitu.
    *   **Kryptografie (Client-Side):** Web Crypto API (`SubtleCrypto`) pro AES-GCM šifrovaní/dešifrování a odvození klíčů (PBKDF2/Argon2id). Pro Argon2id případně `argon2-browser` (WASM).
    *   **Styling:** **Bootstrap** (pro rychlé a responzivní UI komponenty a layout).
    *   **Stavový Management:** Svelte Stores (vestavěné a efektivní pro správu stavu aplikace).
    *   **Browser Storage (`localStorage`):** Pro ukládání uživatelských preferencí - aktuálně pro skrytí uvítací zprávy po prvním přečtení.

3.  **(Budoucí) Java Desktop Aplikace:**
    *   **Jazyk:** Java (LTS verze, např. 17 nebo 21).
    *   **GUI Framework:** **JavaFX** (pro moderní a stylovatelné UI).
    *   **HTTP Klient:** OkHttp nebo vestavěný `java.net.http.HttpClient`.
    *   **JSON Zpracování:** Jackson nebo Gson.
    *   **Kryptografie (Client-Side):** Java Cryptography Architecture (JCA/JCE) pro AES, PBKDF2. Pro Argon2id knihovna třetí strany (např. `de.mkammerer.argon2:argon2-jvm`).
    *   **Build Tool:** Maven nebo Gradle.

## IV. Databázové Schéma (Rozšířené - PostgreSQL, cca 8-9 tabulek):

1.  **`users` tabulka:**
    *   `id` (SERIAL PRIMARY KEY)
    *   `username` (VARCHAR, UNIQUE, NOT NULL)
    *   `login_password_hash` (VARCHAR, NOT NULL)
    *   `login_salt` (VARCHAR, NOT NULL)
    *   `encryption_salt` (VARCHAR, NOT NULL)
    *   `avatar_url` (TEXT, NULLABLE) - *URL k profilovému obrázku uživatele (pouze URL, bez uploadu)*
    *   `(Budoucí) public_key` (TEXT)
    *   `(Budoucí) encrypted_private_key` (TEXT)
    *   `created_at` (TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)
    *   `updated_at` (TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)
2.  **`roles` tabulka:**
    *   `id` (SERIAL PRIMARY KEY)
    *   `name` (VARCHAR(50), UNIQUE, NOT NULL) - *Např. 'user', 'admin'*
3.  **`user_roles` tabulka (propojovací M:N):**
    *   `user_id` (INTEGER, REFERENCES `users`(`id`) ON DELETE CASCADE)
    *   `role_id` (INTEGER, REFERENCES `roles`(`id`) ON DELETE CASCADE)
    *   PRIMARY KEY (`user_id`, `role_id`)
4.  **`credentials` tabulka (Typ obsahu 1):**
    *   `id` (SERIAL PRIMARY KEY)
    *   `user_id` (INTEGER, REFERENCES `users`(`id`) ON DELETE CASCADE, NOT NULL)
    *   `encrypted_title` (TEXT, NOT NULL) - *Název záznamu pro identifikaci*
    *   `encrypted_data` (TEXT, NOT NULL) - *AES-GCM šifrovaný JSON blob s loginem, heslem, URL, poznámkami k heslu*
    *   `encryption_iv` (VARCHAR(24), NOT NULL) - *Base64 kódovaný IV pro AES-GCM (optimalizováno z VARCHAR(255))*
    *   `created_at` (TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)
    *   `updated_at` (TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)
5.  **`secure_notes` tabulka (Typ obsahu 2):**
    *   `id` (SERIAL PRIMARY KEY)
    *   `user_id` (INTEGER, REFERENCES `users`(`id`) ON DELETE CASCADE, NOT NULL)
    *   `encrypted_title` (TEXT, NOT NULL) - *Název poznámky*
    *   `encrypted_content` (TEXT, NOT NULL) - *AES-GCM šifrovaný text poznámky*
    *   `encryption_iv` (VARCHAR(24), NOT NULL) - *Base64 kódovaný IV pro AES-GCM (optimalizováno z VARCHAR(255))*
    *   `created_at` (TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)
    *   `updated_at` (TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)
6.  **`password_categories` tabulka:**
    *   `id` (SERIAL PRIMARY KEY)
    *   `user_id` (INTEGER, REFERENCES `users`(`id`) ON DELETE CASCADE, NOT NULL) - *Kategorie definované uživatelem*
    *   `name` (VARCHAR(100), NOT NULL)
    *   `color_hex` (VARCHAR(7), NULLABLE) - *Např. '#RRGGBB' pro vizuální odlišení v UI*
    *   UNIQUE (`user_id`, `name`)
7.  **`credential_category_links` tabulka (propojovací M:N):**
    *   `credential_id` (INTEGER, REFERENCES `credentials`(`id`) ON DELETE CASCADE)
    *   `category_id` (INTEGER, REFERENCES `password_categories`(`id`) ON DELETE CASCADE)
    *   PRIMARY KEY (`credential_id`, `category_id`)
8.  **`audit_logs` tabulka:**
    *   `id` (SERIAL PRIMARY KEY)
    *   `user_id_actor` (INTEGER, REFERENCES `users`(`id`) ON DELETE SET NULL, NULLABLE) - *Kdo akci provedl*
    *   `action_type` (VARCHAR(100), NOT NULL) - *Např. 'USER_LOGIN', 'CREDENTIAL_CREATE', 'ADMIN_VIEW_USERS'*
    *   `target_entity` (VARCHAR(50), NULLABLE) - *Např. 'user', 'credential', 'note'*
    *   `target_id` (INTEGER, NULLABLE) - *ID ovlivněné entity*
    *   `timestamp` (TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)
    *   `details` (JSONB, NULLABLE) - *Další kontextové informace k logu, např. IP adresa (s ohledem na GDPR)*
9.  **(Budoucí) `shared_credentials` tabulka:** Pro logiku sdílení, bude obsahovat `owner_user_id`, `shared_with_user_id`, `encrypted_data_for_recipient`, `permissions`.

## V. API Endpoints (Rozšířené - FastAPI):

*   **`/auth/`**:
    *   `POST /auth/register`: Registrace uživatele (přijme `username`, `login_password_hash`, `login_salt`, `encryption_salt`).
    *   `GET /auth/salts?username={username}`: Vrátí `login_salt` a `encryption_salt` pro daného uživatele.
    *   `POST /auth/login`: Ověření (přijme `username`, `login_password_hash`), vrátí JWT s informacemi o uživateli a roli.
*   **`/users/`**:
    *   `GET /users/me` (chráněno JWT): Informace o přihlášeném uživateli (včetně `avatar_url`, rolí).
    *   `PUT /users/me/avatar` (chráněno JWT): Aktualizace `avatar_url` (přijme pouze URL string, žádný upload souborů).
*   **`/credentials/`** (chráněno JWT):
    *   `POST /`: Vytvoření nového hesla (včetně přiřazení ke kategoriím).
    *   `GET /`: Seznam hesel přihlášeného uživatele (s možností filtrování podle kategorií).
    *   `GET /{credential_id}`: Detail konkrétního hesla.
    *   `PUT /{credential_id}`: Aktualizace hesla.
    *   `DELETE /{credential_id}`: Smazání hesla.
*   **`/secure-notes/`** (chráněno JWT):
    *   `POST /`: Vytvoření nové bezpečné poznámky.
    *   `GET /`: Seznam bezpečných poznámek přihlášeného uživatele.
    *   `GET /{note_id}`: Detail konkrétní poznámky.
    *   `PUT /{note_id}`: Aktualizace poznámky.
    *   `DELETE /{note_id}`: Smazání poznámky.
*   **`/categories/`** (chráněno JWT):
    *   `POST /`: Vytvoření nové kategorie hesel.
    *   `GET /`: Seznam kategorií přihlášeného uživatele.
    *   `PUT /{category_id}`: Aktualizace kategorie.
    *   `DELETE /{category_id}`: Smazání kategorie (s ošetřením navázaných hesel).
*   **`/admin/` (chráněno JWT a rolí Admin):**
    *   `GET /admin/users`: Seznam všech uživatelů (základní info, role).
    *   `PUT /admin/users/{user_id}/role`: Přiřazení/odebrání role uživateli.
    *   `GET /admin/audit-logs`: Zobrazení auditních logů s možností filtrování (podle uživatele, typu akce, časového období).

## VI. Client-Side Workflow (Rozšířený - SvelteKit):

1.  **Registrace, Přihlášení, Správa Hesel:** Základní logika zůstává (generování saltů, KDF, šifrování/dešifrování). Integruje se práce s kategoriemi při vytváření/editaci hesel.
2.  **Správa Bezpečných Poznámek:** Nová sekce v UI s CRUD operacemi (vytvoření, zobrazení seznamu, detail, editace, mazání), využívá stejný princip šifrování jako hesla.
3.  **Správa Profilu:** Možnost změnit/nastavit `avatar_url` zadáním URL (validace URL formátu na klientovi i serveru). Zobrazení uživatelských informací.
4.  **Správa Kategorií:** UI pro vytváření, editaci (název, barva), mazání kategorií hesel. UI pro přiřazování hesel k jedné či více kategoriím (např. pomocí checkboxů nebo multi-selectu při editaci hesla).
5.  **Administrátorské Rozhraní:** Pokud je přihlášený uživatel s rolí Admin, zobrazí se mu v navigaci další sekce pro správu uživatelů (zobrazení seznamu, změna rolí) a prohlížení audit logů (s filtry).
6.  **Ukládání do `localStorage`:** Implementace pro ukládání flagu "uvítací zpráva skryta" po jejím zavření uživatelem.

## VII. Vývojové Nástroje a Workflow:

*   **Kontejnerizace:** **Docker** a **Docker Compose** pro konzistentní vývojové a (potenciálně) produkční prostředí.
    *   **`Dockerfile` (pro FastAPI):** Definuje image s Pythonem, závislostmi a aplikací.
    *   **`docker-compose.yml`:** Spravuje spuštění FastAPI aplikace a lokální PostgreSQL databáze (pro vývoj, pokud se nepoužije přímo Neon.tech i pro lokální testování), propojuje je.
*   **Verzování:** **Git** (s využitím platforem jako GitHub, GitLab, nebo Bitbucket pro repozitář a správu verzí).
*   **IDE (Integrovaná Vývojová Prostředí):**
    *   Backend (Python/FastAPI): VS Code (s Python a Pylance rozšířeními), PyCharm.
    *   Frontend (SvelteKit): VS Code (s Svelte a Prettier rozšířeními).
    *   Java Desktop: IntelliJ IDEA.
*   **API Testování:** Postman nebo Insomnia pro manuální testování API endpointů, případně využití automaticky generovaného Swagger UI (`/docs`) a ReDoc (`/redoc`) z FastAPI.

## VIII. Nasazení (Deployment MVP):

1.  **Backend (FastAPI):**
    *   **Platforma:** **Render.com** (pro nasazení Docker kontejneru).
    *   **Databáze:** **Neon.tech** (spravovaná PostgreSQL, připojení přes connection string).
    *   **Proces:** Aplikace se zabalí do Docker kontejneru. Render.com stáhne image z připojeného Git repozitáře (nebo Docker registru) a spustí jej. Nastavení environmentálních proměnných (včetně `DATABASE_URL` pro Neon.tech) v rozhraní Renderu.
2.  **Frontend (SvelteKit):**
    *   **Build:** Použití SvelteKit `adapter-static` pro generování statických HTML, CSS a JavaScript souborů.
    *   **Platforma:** **Netlify**, **Vercel**, nebo **Cloudflare Pages** (všechny nabízejí snadné nasazení statických webů, CI/CD z Git repozitáře, automatické SSL a globální CDN).
3.  **Doména a SSL:** Vlastní doména (např. `passowl.app`). SSL certifikáty zajištěny hostingovými platformami (Render, Netlify/Vercel/Cloudflare) pomocí Let's Encrypt. **Použití HTTPS je absolutní nutností** pro bezpečnost a funkci Web Crypto API.
4.  **CORS (Cross-Origin Resource Sharing):** Nastavení na FastAPI backendu, aby explicitně povoloval požadavky z domény (nebo domén), na které běží frontendová aplikace.

## IX. Příprava na Rozšíření:

*   **Sdílení hesel:** Databázové schéma `users` obsahuje pole pro asymetrické klíče. Je navržena tabulka `shared_credentials`. Implementace bude vyžadovat rozšíření API a klientské logiky pro správu klíčů a šifrování/dešifrování pro příjemce.
*   **Java Desktop Aplikace:** Architektura API je připravena pro komunikaci s dalším klientem. Java aplikace bude muset implementovat stejnou logiku pro KDF a client-side šifrování/dešifrování pomocí Java kryptografických knihoven.
*   **Další funkce:** Modulární struktura API a frontendu usnadní přidávání dalších funkcí (např. generátor hesel, kontrola síly hesla, import/export dat, 2FA pro přihlášení k aplikaci samotné – neplést s 2FA pro uložená hesla).

## X. Shrnutí základního kódu (Struktura a Rozšíření):
Původní návrh kódu (FastAPI s `users` a `credentials`) bude třeba rozšířit o:
*   **Nové SQLAlchemy modely:** Pro `roles`, `user_roles`, `secure_notes`, `password_categories`, `credential_category_links`, `audit_logs`. Přidání sloupce `avatar_url` do `users` a `encrypted_title` do `credentials` a `secure_notes`.
*   **Nové Pydantic schémata:** Pro validaci vstupních a výstupních dat pro všechny nové entity a operace.
*   **Nové CRUD funkce (v `app/crud.py`):** Pro všechny nové modely.
*   **Nové API endpointy (v `app/routers/`):** Pro správu nových entit a funkcí, včetně administrátorských.
*   **Logika pro role-based access control:** Vytvoření FastAPI dependencies, které ověřují JWT a kontrolují uživatelské role pro přístup k chráněným endpointům.
*   **Logování akcí do `audit_logs`:** Implementace mechanismu, který při klíčových operacích (registrace, login, CRUD operace, změny rolí) vytvoří záznam v `audit_logs`.
*   **Obsluha `avatar_url`:** Endpoint pro aktualizaci URL (pouze validace a uložení URL string, bez file uploadu).

---