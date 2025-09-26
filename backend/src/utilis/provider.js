function detectProvider(phone) {
  if (!phone) return null;

  let normalized = phone.replace(/\s+/g, "");
  if (normalized.startsWith("+255")) normalized = "0" + normalized.slice(4);
  else if (normalized.startsWith("255")) normalized = "0" + normalized.slice(3);

  if (normalized.startsWith("075") || normalized.startsWith("074") || normalized.startsWith("076")) return "vodacom";
  if (normalized.startsWith("071") || normalized.startsWith("065") || normalized.startsWith("067")) return "tigo";
  if (normalized.startsWith("068") || normalized.startsWith("078")) return "airtel";
  if (normalized.startsWith("062")) return "halotel";

  return null;
}

module.exports = { detectProvider };
