const fs = require('fs');

// 1. Update certificate-verifier.tsx EnrollmentList
const verifierPath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/components/certificate-verifier.tsx';
let verifierContent = fs.readFileSync(verifierPath, 'utf8').replace(/\r\n/g, '\n');

const enrollmentOld = `            <div className="p-3.5 rounded-xl bg-background/15 border border-primary-foreground/20 backdrop-blur-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-primary-foreground/70 uppercase">
                  {isSinhala ? 'සත්‍යාපිත ශිෂ්‍යයා' : 'Verified Graduate'}
                </span>
                <h3 className="text-base sm:text-lg font-headline font-bold text-primary-foreground">
                  {studentData.studentInfo.name_on_certificate || studentData.studentInfo.full_name}
                </h3>
                <p className="text-xs font-mono text-primary-foreground/85">
                  Student Index: {studentData.studentInfo.username}
                </p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified</span>
              </Badge>
            </div>

            <p className="text-xs font-semibold text-primary-foreground/90 pt-1">
              {isSinhala ? 'ප්‍රතිඵල බැලීමට පාඨමාලාව තෝරන්න (Select Enrollment):' : 'Select Enrollment to View Result:'}
            </p>

            {enrollments.map((enrollment) => (
                <Link 
                  key={enrollment.id} 
                  href={\`/result-view?CourseCode=\${enrollment.course_code}&LoggedUser=\${studentUsername}\`} 
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-background text-foreground hover:bg-muted transition-all shadow-md hover:shadow-lg group"
                >
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-headline font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {enrollment.parent_course_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {enrollment.batch_name} ({enrollment.course_code})
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
            ))}`;

const enrollmentNew = `            <div className="p-3.5 rounded-xl bg-background/15 border border-primary-foreground/20 backdrop-blur-sm flex items-center justify-between text-left">
              <div className="text-left">
                <span className="text-[11px] font-mono text-primary-foreground/70 uppercase block text-left">
                  {isSinhala ? 'සත්‍යාපිත ශිෂ්‍යයා' : 'Verified Graduate'}
                </span>
                <h3 className="text-base sm:text-lg font-headline font-bold text-primary-foreground text-left">
                  {studentData.studentInfo.name_on_certificate || studentData.studentInfo.full_name}
                </h3>
                <p className="text-xs font-mono text-primary-foreground/85 text-left mt-0.5">
                  Student Index: {studentData.studentInfo.username}
                </p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified</span>
              </Badge>
            </div>

            <p className="text-xs font-semibold text-primary-foreground/90 pt-1 text-left px-1">
              {isSinhala ? 'ප්‍රතිඵල බැලීමට පාඨමාලාව තෝරන්න (Select Enrollment):' : 'Select Enrollment to View Result:'}
            </p>

            {enrollments.map((enrollment) => (
                <Link 
                  key={enrollment.id} 
                  href={\`/result-view?CourseCode=\${enrollment.course_code}&LoggedUser=\${studentUsername}\`} 
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-background text-foreground hover:bg-muted transition-all shadow-md hover:shadow-lg group text-left"
                >
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex-grow min-w-0 text-left">
                        <p className="font-headline font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate text-left">
                          {enrollment.parent_course_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono text-left mt-0.5">
                          {enrollment.batch_name} ({enrollment.course_code})
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
            ))}`;

if (verifierContent.includes(enrollmentOld)) {
  verifierContent = verifierContent.replace(enrollmentOld, enrollmentNew);
  fs.writeFileSync(verifierPath, verifierContent, 'utf8');
  console.log('Successfully updated enrollment alignment in certificate-verifier.tsx');
} else {
  console.log('enrollmentOld not found in certificate-verifier.tsx');
}

// 2. Update certificate-verifier-home.tsx
const homePath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/components/certificate-verifier-home.tsx';
let homeContent = fs.readFileSync(homePath, 'utf8').replace(/\r\n/g, '\n');

const homeTarget = `<div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">`;
const homeReplace = `<div className="min-w-0 text-left">
                            <div className="flex items-center gap-2 flex-wrap text-left">`;

if (homeContent.includes(homeTarget)) {
  homeContent = homeContent.replace(homeTarget, homeReplace);
  fs.writeFileSync(homePath, homeContent, 'utf8');
  console.log('Successfully updated alignment in certificate-verifier-home.tsx');
} else {
  console.log('homeTarget not found');
}
