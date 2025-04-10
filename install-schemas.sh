#!/bin/bash

# Создаем директорию для схем, если её нет
mkdir -p ~/.local/share/glib-2.0/schemas/

# Копируем схему
cp schemas/org.gnome.shell.extensions.duolingo-reminder.gschema.xml ~/.local/share/glib-2.0/schemas/

# Компилируем схемы
glib-compile-schemas ~/.local/share/glib-2.0/schemas/ 