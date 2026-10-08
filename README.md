<div align="center">

<img src="assets/readme/hero.gif" width="1200" alt="PIMX VEIL: an encrypted payload inside a layered carrier envelope" />

**[English](README.md) · [فارسی](README.fa.md)**

</div>

# 🫥 PIMX VEIL

<!-- pimx-live-site:start -->
## Live website

**[Open PIMX_VEIL ↗](https://pimxveil.pages.dev/)**
<!-- pimx-live-site:end -->

A browser workbench that encrypts a payload and appends it, together with metadata, to a carrier file. Extraction recovers the encrypted envelope for password-based decryption.

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_VEIL) · [PIMX / Profile](https://github.com/MOHAMMADREZAABEDINPOOR) · [Static artwork](assets/readme/hero.png)

| At a glance | Details |
|:---|:---|
| 🫥 Experience | Web application / browser experience |
| 🧰 Built with | `React` · `Vite` · `TypeScript` · `Express` |
| 🌐 Documentation | [English](README.md) · [فارسی](README.fa.md) |

[✨ Features](#features) · [🚀 Getting started](#getting-started) · [⚙️ Configuration](#configuration) · [🌍 Deployment](#deployment)

---

<a id="features"></a>

## ✨ Features

| Area | Included capability |
|:---|:---|
| 🔐 Protection | AES-256-GCM encryption through Web Crypto |
| ⚡ Workflow | PBKDF2-SHA-256 derivation with 600,000 iterations |
| ⚡ Workflow | Carrier/payload packaging and SHA-256 checksums |
| 🔐 Protection | Encryption/decryption panes and multilingual settings |

<a id="stack"></a>

## 🧰 Stack

| Tool | Version / source |
|---|---|
| React | `^19.0.1` |
| Vite | `^6.2.3` |
| TypeScript | `~5.8.2` |
| Express | `^4.21.2` |
| Motion | `^12.23.24` |
| Tailwind CSS | `^4.1.14` |

<a id="getting-started"></a>

## 🚀 Getting started

Node.js 22.12+ and the package manager declared in package.json. Install dependencies from the checked-in lockfile where available.

```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_VEIL.git
cd PIMX_VEIL

npm ci
npm run dev
```

<a id="configuration"></a>

## ⚙️ Configuration

These names are found in the example configuration or source; not all are required. Check their defaults/usage in those files and supply secrets only in your local or hosting environment.

| Name | Role |
|---|---|
| `ADMIN_PATH` | Application setting; inspect its definition |
| `APP_URL` | Application setting; inspect its definition |
| `GEMINI_API_KEY` | Credential/connection setting; keep private |

<a id="usage"></a>

## 🎯 Usage

Choose a carrier and a payload, enter a strong password and save the packaged file. In the decrypt pane, load that exact file and use the original password.

<a id="project-structure"></a>

## 🗂️ Project structure

| Path | Role |
|---|---|
| [`assets/`](assets/) | Brand/media/README assets |
| [`src/`](src/) | Application source |
| [`index.html`](index.html) | Project entry/configuration file |
| [`metadata.json`](metadata.json) | Project entry/configuration file |
| [`package.json`](package.json) | Project entry/configuration file |
| [`tsconfig.json`](tsconfig.json) | Project entry/configuration file |

<a id="commands-and-checks"></a>

## 🧪 Commands and checks

| Command | Purpose |
|:---|:---|
| `npm run dev` | 🧑‍💻 Development server |
| `npm run build` | 📦 Production build |
| `npm run preview` | 👀 Preview a build |
| `npm run lint` | 🧹 Lint source |

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

These commands are declared in package.json; the list is not a test execution report. Test commands may need a browser, service or prepared database.

<a id="deployment"></a>

## 🌍 Deployment

Deploy the build according to its architecture: server-backed projects need a Node process; static Vite frontends can host dist. Pages functions, KV or D1 require separate configuration.

<a id="limitations"></a>

## 📌 Limitations

The implementation appends a recognizable marker and metadata; it is not LSB image steganography and does not make data undetectable. Re-encoding a carrier may remove appended bytes. There is no independent security audit.

<a id="troubleshooting"></a>

## 🛠️ Troubleshooting

- Missing packages: install dependencies using the project’s package manager.
- API/network failure: check the configured origin, provider and hosting bindings.
- Old assets: rebuild when a build script exists, then clear the browser cache.

<a id="contributing"></a>

## 🤝 Contributing

Create a focused branch, verify the affected behavior and explain the change clearly. Keep private data, build outputs and local databases out of commits.

Supporting guides:

- [DEPLOYMENT.md](DEPLOYMENT.md)

<a id="license"></a>

## 📄 License

No repository-level license file is included in this snapshot. Public visibility alone does not grant reuse rights; contact the repository owner for terms.

---

Part of **PIMX** · Documentation in English and Persian.

---

<div align="center">

🫥 **PIMX VEIL** · [English](README.md) · [فارسی](README.fa.md)

</div>
