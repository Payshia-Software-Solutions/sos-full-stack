const fs = require('fs');

// 1. Update front-web/src/components/certificate-verifier.tsx
const verifierPath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/components/certificate-verifier.tsx';
let verifierContent = fs.readFileSync(verifierPath, 'utf8').replace(/\r\n/g, '\n');

const verifierOld = `                    {/* Quick Demo Chips */}
                    {!query && (
                      <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs text-primary-foreground/80 pt-1">
                        <span className="text-[11px] font-medium">{isSinhala ? 'උත්සාහ කරන්න:' : 'Try searching:'}</span>
                        {["PA24600", "CREF4307", "Kasun", "Dilshan"].map((sample) => (
                          <button
                            key={sample}
                            type="button"
                            onClick={() => setQuery(sample)}
                            className="px-2.5 py-0.5 rounded-md bg-primary-foreground/15 hover:bg-primary-foreground/30 text-primary-foreground font-mono text-[11px] transition-colors border border-primary-foreground/20 font-semibold cursor-pointer"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    )}`;

const verifierNew = `                    {/* Example Search Hint */}
                    {!query && (
                      <p className="text-xs text-primary-foreground/85 pt-1 text-center font-body">
                        <span className="font-medium">{isSinhala ? 'උදාහරණ (e.g.): ' : 'Examples: '}</span>
                        <span className="font-mono text-primary-foreground/95">PA24600</span>
                        <span className="mx-1.5 opacity-60">•</span>
                        <span className="font-mono text-primary-foreground/95">CREF4307</span>
                        <span className="mx-1.5 opacity-60">•</span>
                        <span className="font-mono text-primary-foreground/95">Kasun</span>
                        <span className="mx-1.5 opacity-60">•</span>
                        <span className="font-mono text-primary-foreground/95">Dilshan</span>
                      </p>
                    )}`;

if (verifierContent.includes(verifierOld)) {
  verifierContent = verifierContent.replace(verifierOld, verifierNew);
  fs.writeFileSync(verifierPath, verifierContent, 'utf8');
  console.log('Successfully updated certificate-verifier.tsx with example text');
} else {
  console.log('verifierOld not found in certificate-verifier.tsx');
}

// 2. Update front-web/src/components/certificate-verifier-home.tsx
const homePath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/components/certificate-verifier-home.tsx';
let homeContent = fs.readFileSync(homePath, 'utf8').replace(/\r\n/g, '\n');

const homeOld = `                {/* Quick Hint / Demo Tags */}
                {!selectedStudentData && filteredStudents.length === 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
                    <span>{isSinhala ? 'උත්සාහ කර බලන්න (Try searching):' : 'Try searching:'}</span>
                    {["PA24600", "CREF4307", "Kasun", "Dilshan"].map((demo) => (
                      <button
                        key={demo}
                        type="button"
                        onClick={() => setQuery(demo)}
                        className="px-2.5 py-0.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors font-mono text-[11px] border border-border/60 font-semibold cursor-pointer"
                      >
                        {demo}
                      </button>
                    ))}
                  </div>
                )}`;

const homeNew = `                {/* Example Search Hint */}
                {!selectedStudentData && filteredStudents.length === 0 && (
                  <p className="text-xs text-muted-foreground pt-1 text-left">
                    <span className="font-medium text-foreground/80">{isSinhala ? 'උදාහරණ (e.g.): ' : 'Examples: '}</span>
                    <span className="font-mono text-foreground/85">PA24600</span>
                    <span className="mx-1.5 opacity-50">•</span>
                    <span className="font-mono text-foreground/85">CREF4307</span>
                    <span className="mx-1.5 opacity-50">•</span>
                    <span className="font-mono text-foreground/85">Kasun</span>
                    <span className="mx-1.5 opacity-50">•</span>
                    <span className="font-mono text-foreground/85">Dilshan</span>
                  </p>
                )}`;

if (homeContent.includes(homeOld)) {
  homeContent = homeContent.replace(homeOld, homeNew);
  fs.writeFileSync(homePath, homeContent, 'utf8');
  console.log('Successfully updated certificate-verifier-home.tsx with example text');
} else {
  console.log('homeOld not found in certificate-verifier-home.tsx');
}
