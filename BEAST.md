# Bonus Features

## 1. Multi-Language Support (German Market Focus)

The system natively supports German tickets without any configuration.

### Why This Works

| Component | German Support |
|-----------|---------------|
| GPT-4.1-mini | Native German understanding |
| text-embedding-3-small | Cross-lingual embeddings |
| pgvector similarity | Language-agnostic |

### Example

**Input:**
```
title: "Passwort abgelaufen"
body: "Ich kann mich nicht mehr anmelden, mein Passwort ist abgelaufen"
```

**Classification:**
```
intent: password_reset
confidence: 0.92
reasoning: "User reports expired password and login failure"
```

**KB Match:**
```
"Passwort-Reset in Active Directory" (similarity: 0.89)
```
