# GhostPass — Demo Video Script

> **Target Length**: 2 minutes 45 seconds (under 3:00 limit)  
> **Format**: Screen recording with voiceover  
> **Style**: Blend of Umbra's technical clarity, Iris's enthusiasm, and Splits's conciseness  
> **Visual**: Split-screen and single-screen transitions, cursor highlights, minimal UI chrome

---

## Pre-Recording Checklist

Before hitting record:
- [ ] Clean browser (no bookmarks bar, no extensions visible, dark mode)
- [ ] Two demo agents pre-registered on Base Sepolia:
  - `trader-alpha.ghostpass.eth` — capabilities: `["trading-signals"]`, pricing: `5 USDC`
  - `researcher-beta.ghostpass.eth` — capabilities: `["market-analysis"]`, pricing: `10 USDC`
- [ ] Both agents funded with Base Sepolia ETH and USDC
- [ ] Browser zoom at 125% for readability
- [ ] Record at 1920x1080, 30fps
- [ ] Have Basescan tab open in background for quick tx verification
- [ ] Close all notifications, Slack, email

---

## SHOT 1: Hook & Problem (0:00 – 0:20)
**Visual**: GhostPass landing page — hero section with tagline "Invisible Wallets for Autonomous Agents"
**Audio**: Energetic, direct

**SCRIPT**:
> "Hi, we're Team GhostPass. I'm [Name], and I built the smart contracts and cryptography. My teammate [Name] built the frontend and agent SDK.
>
> AI agents are becoming first-class economic actors. They trade, hire each other, and settle payments. But every onchain transaction leaks their wallet address. If you can see who pays whom, you can frontrun a trader, copy a researcher's clients, or trace an agent's entire financial history.
>
> GhostPass fixes this."

**Transition**: Fade to black, then fade into registration screen

---

## SHOT 2: Registration — The Setup (0:20 – 0:50)
**Visual**: `/register` page, Step 1 "Generate Keys"
**Audio**: Clear, step-by-step, like Iris's demo energy

**SCRIPT**:
> "Here's how it works. First, an agent registers with GhostPass. Let's create `trader-alpha`.
>
> Step one: we generate a stealth key pair right in the browser. The spending key receives funds. The viewing key scans for them. Both are generated locally — we never see the private keys.
>
> [click 'Generate Keys']
>
> Step two: the agent sets its capabilities and pricing. This agent offers trading signals for five USDC.
>
> [type capabilities, type pricing]
>
> Step three: we submit to the GhostPass registry on Base Sepolia and mint a gasless ENS subname through NameStone. 
>
> [click 'Register' — MetaMask popup appears, confirm, toast shows 'Success']
>
> Done. `trader-alpha.ghostpass.eth` is live."

**Transition**: Hard cut to dashboard page showing the newly registered agent

---

## SHOT 3: The Dashboard — Identity with Privacy (0:50 – 1:10)
**Visual**: `/dashboard` for `trader-alpha.ghostpass.eth`
**Audio**: Proud, showing off the identity layer

**SCRIPT**:
> "The agent now has a persistent, human-readable identity. Anyone can discover its capabilities, its pricing, and its reputation — all stored in ENS text records.
>
> But here's the key: when someone wants to pay this agent, they don't get its real wallet. They get something much better. Watch this."

**Transition**: Cursor clicks "Copy Subname", hard cut to discovery/pay page

---

## SHOT 4: The Magic — Resolution (1:10 – 1:40)
**Visual**: `/pay/trader-alpha.ghostpass.eth` — the left side of screen
**Audio**: Building excitement — this is the core innovation

**SCRIPT**:
> "Let's pay `trader-alpha`. I click 'Resolve Stealth Address.'
>
> [click 'Resolve Stealth Address' — loading spinner, then address appears: 0x7a3f...]
>
> GhostPass uses CCIP Read to call our offchain gateway. The gateway generates an ephemeral key, derives a one-time stealth address from the agent's public meta-address, and returns it — signed and verifiable.
>
> Now here's the magic. Let me resolve it again.
>
> [click 'Resolve Again' — a COMPLETELY DIFFERENT address appears: 0x9b2e...]
>
> Completely different address. Same ENS name. Every single resolution returns a unique, never-before-used stealth address. That's auto-rotating privacy on every lookup."

**Transition**: Zoom cursor to "Send Payment" button, then hard cut to split screen

---

## SHOT 5: The Payment — Split Screen (1:40 – 2:10)
**Visual**: SPLIT SCREEN — Left shows buyer wallet sending 5 USDC. Right shows Basescan tx confirmation.
**Audio**: Confident, like Umbra's two-browser demo

**SCRIPT**:
> "Let's send five USDC to this stealth address.
>
> [click 'Send Payment' — MetaMask confirm, transaction submitted]
>
> Transaction confirmed. The funds are now sitting in a one-time address that has never existed before and will never exist again. No observer can link this payment to `trader-alpha`. No one can trace who the customer was. The transaction graph is broken.
>
> [Basescan shows transfer to 0x7a3f... — note it's a fresh address with no prior history]
>
> And because the agent owns the viewing key, it can scan the blockchain, find this payment, derive the private key for this exact address, and sweep the funds."

**Transition**: Hard cut back to dashboard, click "Scan for Payments"

---

## SHOT 6: Recovery — The Payoff (2:10 – 2:30)
**Visual**: `/dashboard` — clicking "Scan for Payments", then table updates with new row, then "Recover" button clicked
**Audio**: Satisfying conclusion

**SCRIPT**:
> "Back on the dashboard, the agent scans for new payments.
>
> [click 'Scan for Payments' — loading, then table populates with 5 USDC payment]
>
> Found it. Five USDC at a stealth address only this agent can detect.
>
> [click 'Recover' — MetaMask confirm]
>
> Recovered. The agent's balance just went from zero to five USDC — and the entire transaction chain is private."

**Transition**: Fade to architecture diagram

---

## SHOT 7: Architecture & Outro (2:30 – 2:55)
**Visual**: Architecture diagram (Mermaid or Figma export) showing contracts, gateway, ENS, and agent flow
**Audio**: Professional wrap-up, like Umbra's closing

**SCRIPT**:
> "GhostPass combines ENS subnames for identity, CCIP Read for dynamic resolution, and elliptic-curve stealth addresses for privacy. It's the first stealth address protocol built specifically for autonomous agents.
>
> We deployed on Base Sepolia with gasless subnames from NameStone. The contracts, SDK, and frontend are all open source.
>
> If you're building agent economies where privacy matters — trading, research, competitive intelligence — GhostPass gives your agents persistent identities with invisible wallets.
>
> Check out the live demo at [URL] and our GitHub repo. Thank you."

**Transition**: Fade to black, then title card

---

## TITLE CARD (Final 5 seconds)
**Visual**: GhostPass logo + hackathon branding
**Text**:
- GhostPass — Invisible Wallets for Autonomous Agents
- ETHGlobal OpenAgents 2026
- github.com/yourteam/ghostpass
- ghostpass.vercel.app

---

## Demo Video Editing Notes

### Pacing
- Keep shots moving. No shot longer than 30 seconds except the architecture outro.
- Cut dead air between clicks. The transaction confirmation can be trimmed to 2 seconds.
- Use jump cuts between form fields when typing (show first few characters, cut, show completed field).

### Cursor & Highlights
- Use a screen recorder that highlights cursor clicks (Screen Studio, CleanShot, or OBS with cursor plugin).
- Zoom in on the address comparison in Shot 4 — this is the "magic moment."
- Add a brief glow or pulse animation around the two different addresses to emphasize they changed.

### Typography Overlays
- Shot 2: Overlay "Step 1: Generate Keys" → "Step 2: Set Profile" → "Step 3: Register"
- Shot 4: Overlay "Resolve #1: 0x7a3f..." then "Resolve #2: 0x9b2e..." with "DIFFERENT ADDRESS" in bold
- Shot 5: Overlay "Payment: 5 USDC" and "Stealth Address: 0x7a3f..." 
- Shot 6: Overlay "Balance: 0 → 5 USDC"

### Audio
- Voiceover should be recorded in a quiet room with a decent microphone (even AirPods Pro work).
- Normalize audio to -16 LUFS.
- Add subtle instrumental background music at -25dB (no lyrics, no copyright — use Epidemic Sound or YouTube Audio Library).
- Music should fade in at 0:03 and fade out at 2:55.

### Color Grading
- Slight boost to saturation so the UI pops.
- Consistent white balance (record during the day or with consistent lighting).

---

## Alternative Takes

### If Registration Takes Too Long
- Pre-register both agents before recording.
- Show registration as a "fast-forward" montage with 2x speed, then cut to the success screen.

### If Transaction Confirmations Are Slow
- Pre-stage the payment transaction but don't broadcast it.
- During recording, broadcast and immediately show the pending state.
- Use a local anvil fork for instant confirmations (less impressive but faster).

### If You Want to Show ENS Text Records
- Add a 10-second shot showing the ENS Manager app with `trader-alpha.ghostpass.eth` text records visible:
  - `ai.capabilities: ["trading-signals"]`
  - `ai.pricing: 5 USDC`
  - `ghostpass.metaaddress: 0x...`
- This proves ENS is doing real work.

---

## Shot List Summary

| Shot | Time | Visual | Audio Tone | Key Moment |
|------|------|--------|-----------|------------|
| 1 | 0:00–0:20 | Landing page | Energetic, direct | Problem statement |
| 2 | 0:20–0:50 | Registration | Step-by-step, excited | Keys generated, agent registered |
| 3 | 0:50–1:10 | Dashboard | Proud | Identity layer working |
| 4 | 1:10–1:40 | Pay page | Building excitement | **Different address on second resolve** |
| 5 | 1:40–2:10 | Split screen | Confident | Payment sent, Basescan confirmation |
| 6 | 2:10–2:30 | Dashboard recovery | Satisfying | Funds recovered, balance updated |
| 7 | 2:30–2:55 | Architecture | Professional | Tech stack, closing, CTA |
| Title | 2:55–3:00 | Title card | None | Links and branding |

---

## What Makes This Script Win

1. **The "Magic Moment" is clear and repeatable**  
   Resolving the same ENS name twice and getting two different addresses is instantly understandable. It's visual, it's surprising, and it proves the core innovation in 10 seconds.

2. **It answers "why" before "how"**  
   Like Umbra, it opens with the problem (traced transactions) before showing the solution. Judges understand the stakes immediately.

3. **It shows end-to-end functionality**  
   Like Iris, it walks through every step: register → resolve → pay → recover. Nothing is hand-waved.

4. **It uses two perspectives**  
   Like Umbra's two-browser demo, the split screen in Shot 5 shows both the payer's action and the onchain result. This proves it's real.

5. **It's under 3 minutes**  
   The script as written is 2:55. With trimming, it should come in at 2:40–2:50. This leaves buffer for slower clicks or network delays.

6. **The architecture outro signals maturity**  
   Like Splits mentioning their recursive design and future plans, the architecture shot shows this isn't just a demo — it's a protocol.
