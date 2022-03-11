#!/bin/bash
set -e

print(){
  printf "\033[38;5;93m"
  printf "$1"
  printf "\033[0m"
}

print "Typechecking..."
yarn typecheck > /dev/null
print "Done\n"

if [[ -z "$HMC_USERNAME" ]]; then
  print "Enter your HMC server username (or set HMC_USERNAME environment variable): "
  read username
else
  username=$HMC_USERNAME
fi

print "Compiling..."
yarn build --base="/~$username/lambda/" > /dev/null
print "Done\n"



print "Uploading..."
rsync -rua --delete dist/ "$username@cs.hmc.edu:~/public_html/lambda/"
print "Website live at https://cs.hmc.edu/~$username/lambda (´｡• ω •｡\`)\n"
