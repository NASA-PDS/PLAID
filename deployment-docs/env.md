# 🌱 Environment Variables

The following table describes the environment variables that alter the behavior of APPS PLAID. In the production environment, the default values suffice. In development, many of these may need to be overridden.

| Variable            | Purpose                                                    | Default             |
|:--------------------|:-----------------------------------------------------------|:--------------------|
| `PLAID_IMAGE_OWNER` | Set to blank to use a local `plaid` Docker image           | `nasapds/`          |
| `PLAID_VERSION`     | Set to a version tag, such as `latest`                     | `1.0.0`             |
| `PLAID_PORT`        | Set to the TCP port number where APPS PLAID listens        | `7166`              |
| `DB_USER`           | Database username                                          | `plaid`             |
| `DB_PASSWORD`       | Password for the database username                         | `password`          |
| `DB_DATABASE`       | Name of the database                                       | `plaid`             |
| `DB_HOST`           | Host where the database is accessed                        | `db`                |
| `SMTP_HOST`         | Host where the SMTP server is accessed                     | `smtp.jpl.nasa.gov` |
| `SMTP_PORT`         | Port number where the SMTP server listens                  | `25`                |
| `SMTP_DOMAIN`       | Domain to use when generating emails                       | `jpl.nasa.gov`      |
| `SMTP_SECURITY`     | SMTP encryption to use; either `TLS`, `STARTTLS`, or blank | (blank)             |
| `SMTP_USER`         | Username if SMTP server requires authentication            | (blank)             |
| `SMTP_PASSWORD`     | Password if SMTP server requires authentication            | (blank)             |

When running `docker compose`, these variables may be set in the host shell (such as with `export` or `setenv`), using the `/usr/bin/env` command, or in an environment file (which `docker compose` reads if specified with `--env-file`). However, putting sensitive credentials such as `SMTP_PASSWORD` in such a file may be risky. Protect such a file carefully.

**👉 Note:** using `/usr/bin/env SMTP_PASSWORD=s3cr3t docker compose …` is also risky, since command-line arguments may be read by any other process on the system.
