set positional-arguments
set dotenv-load

deploy-knuth:
  #!/bin/sh
  if [ "${KNUTH_USER+_}" != '_' ]; then
    echo 'KNUTH_USER environment variable undefined;' \
      'you can define it in a `.env` file, e.g.:' >&2
    echo '  KNUTH_USER=kwshi' >&2
    exit 1
  fi
  yarn vite build --base "/~$KNUTH_USER/lambda/"
  rsync -r -d --del -p --chmod=D0755,F0644 'dist/' \
    "$KNUTH_USER@knuth.cs.hmc.edu:public_html/lambda"
