<<<<<<< HEAD
<script>
  async function sendChat() {
    const message = document.getElementById("msg").value;

    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    document.getElementById("reply").innerText = data.reply;
  }
</script>
=======
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
>>>>>>> 921d5a7daf909d4a6576eadb80c3c2a38d94627f
