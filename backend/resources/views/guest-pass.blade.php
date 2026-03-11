<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Guest Pass QR</title>
  <style>
    :root {
      --bg: #f4f1ea;
      --card: #fffdf7;
      --ink: #17222c;
      --muted: #5a6570;
      --line: #d8d1c3;
      --accent: #1f6f5f;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at 10% 10%, #d8ece6 0%, transparent 28%),
        radial-gradient(circle at 90% 0%, #f8dfbf 0%, transparent 24%),
        var(--bg);
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .card {
      width: min(520px, 100%);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: 0 18px 50px rgba(23, 34, 44, 0.12);
      padding: 24px;
      text-align: center;
    }

    h1 {
      margin: 0 0 10px;
      font-size: 1.45rem;
      letter-spacing: 0.02em;
    }

    p {
      margin: 0 0 14px;
      color: var(--muted);
      line-height: 1.5;
    }

    #qr {
      margin: 10px auto 18px;
      padding: 12px;
      width: fit-content;
      border-radius: 14px;
      background: #fff;
      border: 1px solid var(--line);
    }

    .hint {
      font-size: 0.95rem;
      color: var(--accent);
      font-weight: 600;
    }

    .token {
      margin-top: 12px;
      text-align: left;
      font-size: 0.85rem;
      color: var(--muted);
      overflow-wrap: anywhere;
      background: #f5f2ea;
      border: 1px dashed var(--line);
      border-radius: 10px;
      padding: 10px;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>Visitor / Delivery Guest Pass</h1>
    <p>No account or app is needed. Show this QR (or a screenshot) at the gate.</p>
    <div id="qr" aria-label="Guest QR code"></div>
    <p class="hint">Tip: Keep this page open or take a screenshot before arriving.</p>
    <div class="token">Token: {{ $token }}</div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
  <script>
    new QRCode(document.getElementById("qr"), {
      text: @json($token),
      width: 260,
      height: 260,
      correctLevel: QRCode.CorrectLevel.M,
    });
  </script>
</body>
</html>
