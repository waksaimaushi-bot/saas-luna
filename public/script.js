async function send() {
  const input = document.getElementById("message");
  const chat = document.getElementById("chat");

  const text = input.value;
  if (!text) return;

  chat.innerHTML += `<p><b>Kamu:</b> ${text}</p>`;
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: text,
      client: "luna"
    })
  });

  const data = await res.json();
  chat.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;
  chat.scrollTop = chat.scrollHeight;
}
