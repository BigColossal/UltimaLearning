import fs from "fs";

const filePath = "./jsCurriculum.json"; // your input file
const outputPath = "./jsCurriculum.json";

const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

data.skill.domains.forEach((domain, domainIndex) => {
  const d = domainIndex + 1;

  // number domain
  domain.name = `${d}. ${domain.name}`;

  // number subskills
  domain.subskills.forEach((subskill, subIndex) => {
    const s = subIndex + 1;
    subskill.name = `${d}.${s} ${subskill.name}`;
  });
});

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log("Roadmap numbering complete.");
