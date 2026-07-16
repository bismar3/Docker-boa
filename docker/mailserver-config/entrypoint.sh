#!/bin/bash
set -e

echo "tecnoweb.edu" > /etc/mailname

if ! id "damaris" &>/dev/null; then
    useradd -m -s /bin/bash damaris
    echo "damaris:123456" | chpasswd
fi

mkdir -p /home/damaris/Maildir/{cur,new,tmp}
chown -R damaris:damaris /home/damaris/Maildir

service postfix start

exec dovecot -F