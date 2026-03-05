import fs from "fs";

function transformRoadmap(rawText, topicName) {
  const skill = {
    name: topicName,
    description: "",
    domains: [],
  };

  const domainRegex = /(\d+)\.\s([^\d]+?)(?=\s\d+\.\s|\s\d+\.\d+\s|$)/g;
  const domainMatches = [...rawText.matchAll(domainRegex)];

  domainMatches.forEach((domainMatch, domainIndex) => {
    const domainNumber = domainMatch[1];
    const domainTitle = `${domainNumber}. ${domainMatch[2].trim()}`;

    const start = domainMatch.index + domainMatch[0].length;
    const end = domainMatches[domainIndex + 1]
      ? domainMatches[domainIndex + 1].index
      : rawText.length;

    const domainContent = rawText.slice(start, end);

    const domain = {
      name: domainTitle,
      description: "",
      subskills: [],
    };

    const subskillRegex = new RegExp(
      `${domainNumber}\\.(\\d+)\\s([^]+?)(?=${domainNumber}\\.\\d+\\s|\\d+\\.\\s|$)`,
      "g",
    );

    const subMatches = [...domainContent.matchAll(subskillRegex)];

    subMatches.forEach((subMatch) => {
      const subNumber = subMatch[1];
      const content = subMatch[2].trim();

      const [name, ...rest] = content.split(". ");
      const description = rest.join(". ");

      domain.subskills.push({
        name,
        description,
      });
    });

    skill.domains.push(domain);
  });

  return { skill };
}

const roadmap = fs.readFileSync("./browser-roadmap.txt", "utf8");

const result = transformRoadmap(roadmap, "Browser Platform APIs");

fs.writeFileSync(
  "./browser-roadmap-structured.json",
  JSON.stringify(result, null, 2),
  "utf8",
);

console.log("Roadmap successfully converted and saved.");
