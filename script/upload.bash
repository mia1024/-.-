#!/usr/bin/env bash
set -eu

print() {
  printf '\e[38;5;93m%s\e[m' "$1"
}

# load .env
if [[ -r '.env' ]]; then
  while read -r def; do
    name="${def%%=*}"
    val="${def#*=}"
    export "$name=$val"
  done < '.env'
fi

# check for upload username
if [[ -v HMC_USERNAME ]]; then username=$HMC_USERNAME; else
  print "Enter your HMC server username (or set HMC_USERNAME environment variable): "
  read -r username
  echo "HMC_USERNAME=$username" >> '.env'
  print $'Saved username to `.env` file.\n'
fi

print "Typechecking..."
yarn typecheck > '/dev/null'
print $'Done\n'

print "Compiling..."
yarn build --base="/~$username/lambda/" > '/dev/null'
print $'Done\n'

print "Uploading..."
rsync -rua --delete 'dist/' "$username@cs.hmc.edu:~/public_html/lambda/"
print $'Website live at https://cs.hmc.edu/~$username/lambda (´｡• ω •｡`)\n'
