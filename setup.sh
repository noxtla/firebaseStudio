#!/bin/bash

echo "🚀 Iniciando configuración del entorno Git con convenciones..."


# Instalar dependencias de desarrollo
echo "📦 Instalando husky, commitlint y commitizen..."
npm install --save-dev husky @commitlint/{config-conventional,cli} commitizen cz-conventional-changelog

# Crear configuración commitlint
echo "📝 Creando commitlint.config.js..."
cat <<EOL > commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
EOL

# Agregar Commitizen config en package.json
echo "⚙️ Configurando Commitizen en package.json..."
npx json -I -f package.json -e 'this.config={"commitizen":{"path":"cz-conventional-changelog"}}'

# Configurar Husky
echo "🔐 Configurando husky y hooks..."
npm pkg set scripts.prepare="husky install"
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Crear archivo .gitignore si no existe
if [ ! -f ".gitignore" ]; then
  echo "node_modules/" > .gitignore
fi

echo "✅ Todo listo. Usa ahora:"
echo ""
echo "👉  npx cz         # Para hacer commits guiados"
echo "👉  git commit -m \"feat(auth): agrega login básico\""
echo ""
echo "💡 BONUS: puedes añadir un README.md con tu estructura de ramas y convención de commits."

