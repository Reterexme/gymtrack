#!/usr/bin/env bash
# Demostración en vivo de GymTrack. Antes: ADMIN_EMAIL=admin@gym.com ADMIN_PASSWORD=Admin1234 JWT_SECRET=demo npm start
# Uso: bash docs/demo.sh   (guarda las salidas en ./demo-salida y las imprime)
J='Content-Type: application/json'
out=${OUT:-./demo-salida}; mkdir -p $out
{
echo '$ POST /api/auth/register   (Ana se registra)'
curl -s -X POST localhost:3000/api/auth/register -H "$J" -d '{"nombre":"Ana Lopez","email":"ana@gym.com","password":"Segura123"}' | python3 -c 'import sys,json;d=json.load(sys.stdin);u=d["usuario"];print(json.dumps({"usuario":{"nombre":u["nombre"],"email":u["email"],"rol":u["rol"]},"token":d["token"][:34]+"..."},indent=2,ensure_ascii=False))'
} > $out/1.txt
curl -s -X POST localhost:3000/api/auth/register -H "$J" -d '{"nombre":"Luis Coach","email":"luis@gym.com","password":"Segura123"}' >/dev/null
ADM=$(curl -s -X POST localhost:3000/api/auth/login -H "$J" -d '{"email":"admin@gym.com","password":"Admin1234"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
read ANAT ANAID < <(curl -s -X POST localhost:3000/api/auth/login -H "$J" -d '{"email":"ana@gym.com","password":"Segura123"}' | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d["token"],d["usuario"]["id"])')
LUISID=$(curl -s localhost:3000/api/usuarios -H "Authorization: Bearer $ADM" | python3 -c 'import sys,json;print([u["id"] for u in json.load(sys.stdin)["usuarios"] if u["email"]=="luis@gym.com"][0])')
{
echo '$ GET /api/usuarios   (Ana, rol usuario)'
curl -s -w '\n-> HTTP %{http_code}\n' localhost:3000/api/usuarios -H "Authorization: Bearer $ANAT"
echo
echo '$ GET /api/usuarios   (sin token)'
curl -s -w '\n-> HTTP %{http_code}\n' localhost:3000/api/usuarios
echo
echo '$ POST /api/auth/login   (contraseña incorrecta)'
curl -s -w '\n-> HTTP %{http_code}\n' -X POST localhost:3000/api/auth/login -H "$J" -d '{"email":"ana@gym.com","password":"Otra1234"}'
} > $out/2.txt
{
echo '$ PATCH /api/usuarios/:id/rol   (admin: Luis -> entrenador)'
curl -s -X PATCH localhost:3000/api/usuarios/$LUISID/rol -H "Authorization: Bearer $ADM" -H "$J" -d '{"rol":"entrenador"}' | python3 -c 'import sys,json;u=json.load(sys.stdin)["usuario"];print(json.dumps({"nombre":u["nombre"],"rol":u["rol"]},ensure_ascii=False))'
LT=$(curl -s -X POST localhost:3000/api/auth/login -H "$J" -d '{"email":"luis@gym.com","password":"Segura123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
echo
echo '$ POST /api/rutinas   (Luis asigna rutina a Ana)'
curl -s -X POST localhost:3000/api/rutinas -H "Authorization: Bearer $LT" -H "$J" -d "{\"nombre\":\"Pierna\",\"ejercicios\":[{\"nombre\":\"Sentadilla\",\"series\":4,\"repeticiones\":10,\"peso\":60}],\"asignadaA\":\"$ANAID\"}" -w '\n%{http_code}' | python3 -c '
import sys,json
body,code=sys.stdin.read().rsplit("\n",1); r=json.loads(body)["rutina"]; e=r["ejercicios"][0]
print(json.dumps({"rutina":r["nombre"],"ejercicio":e["nombre"]+" 4x10 @ 60 kg","asignadaA":"Ana Lopez"},indent=2,ensure_ascii=False)); print("-> HTTP "+code)'
echo
echo '$ GET /api/rutinas   (Ana consulta sus rutinas)'
curl -s localhost:3000/api/rutinas -H "Authorization: Bearer $ANAT" | python3 -c 'import sys,json;print(json.dumps({"rutinas":[r["nombre"] for r in json.load(sys.stdin)["rutinas"]]},ensure_ascii=False))'
} > $out/3.txt
cat "${OUT:-./demo-salida}"/*.txt
