"use client";

function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <>
      {paragraphs.map((para, pi) => {
        const lines = para.split("\n");
        const isList = lines.every((l) => /^[-•]\s/.test(l.trim()) || !l.trim());
        if (isList) {
          return (
            <ul key={pi} className="my-1 ml-4 list-disc space-y-0.5">
              {lines.filter((l) => l.trim()).map((l, li) => (
                <li key={li}><InlineFormat text={l.replace(/^[-•]\s*/, "")} /></li>
              ))}
            </ul>
          );
        }
        const numberedList = lines.every((l) => /^\d+[.)]\s/.test(l.trim()) || !l.trim());
        if (numberedList) {
          return (
            <ol key={pi} className="my-1 ml-4 list-decimal space-y-0.5">
              {lines.filter((l) => l.trim()).map((l, li) => (
                <li key={li}><InlineFormat text={l.replace(/^\d+[.)]\s*/, "")} /></li>
              ))}
            </ol>
          );
        }
        return (
          <p key={pi} className={pi > 0 ? "mt-2" : ""}>
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 && <br />}
                <InlineFormat text={line} />
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
