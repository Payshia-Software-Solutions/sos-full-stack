const fs = require('fs');
const filePath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/components/certificate-verifier.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Update SearchResults component to remove the 100x100 placeholder and enforce strict left-alignment on all items
const searchResultsOld = `    return (
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto animate-in fade-in-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left">
            <p className="text-xs font-semibold text-primary-foreground/85 px-1">
              {isSinhala ? \`ගැලපෙන සිසුන් \${students.length} ක් හමුවිය:\` : \`Found \${students.length} matching record(s):\`}
            </p>
            {students.map((student) => (
                <button 
                  key={student.id + student.username} 
                  onClick={() => onStudentSelect(student)} 
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-background text-foreground hover:bg-muted/95 transition-all shadow-md hover:shadow-lg group border border-border/80"
                >
                    <Avatar className="h-11 w-11 border-2 border-primary/20 shrink-0">
                        <AvatarImage src={\`https://placehold.co/100x100.png\`} alt={student.name_on_certificate} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {student.name_on_certificate?.charAt(0) || <User className="text-muted-foreground" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-headline font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                            {student.name_on_certificate}
                          </p>
                          {student.certificate_id && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {student.certificate_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Index: <span className="font-semibold text-foreground/85">{student.username}</span>
                          {student.student_id && student.student_id !== student.username && (
                            <span className="ml-1.5 opacity-70">({student.student_id})</span>
                          )}
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <span>{isSinhala ? 'තහවුරු කරන්න' : 'Verify'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                </button>
            ))}
        </div>
    );`;

const searchResultsNew = `    return (
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto animate-in fade-in-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left">
            <p className="text-xs font-semibold text-primary-foreground/85 px-1 text-left">
              {isSinhala ? \`ගැලපෙන සිසුන් \${students.length} ක් හමුවිය:\` : \`Found \${students.length} matching record(s):\`}
            </p>
            {students.map((student) => (
                <button 
                  key={student.id + student.username} 
                  onClick={() => onStudentSelect(student)} 
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-background text-foreground hover:bg-muted/95 transition-all shadow-md hover:shadow-lg group border border-border/80 text-left cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0 uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                        {student.name_on_certificate?.trim().charAt(0) || <User className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-grow min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap text-left">
                          <p className="font-headline font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate text-left">
                            {student.name_on_certificate}
                          </p>
                          {student.certificate_id && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {student.certificate_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 text-left">
                          Index: <span className="font-semibold text-foreground/85">{student.username}</span>
                          {student.student_id && student.student_id !== student.username && (
                            <span className="ml-1.5 opacity-70">({student.student_id})</span>
                          )}
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <span>{isSinhala ? 'තහවුරු කරන්න' : 'Verify'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                </button>
            ))}
        </div>
    );`;

if (content.includes(searchResultsOld)) {
  content = content.replace(searchResultsOld, searchResultsNew);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated SearchResults in certificate-verifier.tsx');
} else {
  console.error('searchResultsOld not found');
}
