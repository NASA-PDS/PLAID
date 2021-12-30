# 👩‍⚖️ Deploying APPS PLAID to Production

To deploy APPS PLAID to production, follow the instructions below.

1. Log into the host that runs the production instance.
2. Assume the identity of the production process user.
3. Change into the directory that contains the `docker-compose.yaml` file for APPS PLAID. If this file doesn't yet exist, [fetch it from GitHub](https://raw.githubusercontent.com/NASA-PDS/PLAID/main/docker/docker-compose.yaml).
4. Stop any existing compostion with `docker compose down`.
5. Pull updated images with `docker compose pull`.
6. Start the composition back up with `docker compose up --detach`.

You may also wish to double-check that the crontab of the production process user includes a `@reboot` entry that also runs `docker compose up --detach` in the correct directory (or uses `--file` to give the full path to the `docker-compose.yaml` file).

If the front-end system administrators have not yet configured the HTTP reverse-proxy for APPS PLAID, inform them to set it up for port 7166.

No further configuration is necessary. Honest 😇.

