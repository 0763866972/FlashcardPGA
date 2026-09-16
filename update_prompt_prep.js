const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

let newPromptLine = `Các giới từ đơn (in, on, at, of, with...) và ĐẶC BIỆT LÀ CÁC GIỚI TỪ GHÉP (ví dụ: as to, as for, according to, on behalf of, regardless of, by means of, ahead of, due to, because of, on account of, prior to, as well as, in addition to, with regard to, in regard to, in spite of, rather than, adhere to, comply with, aside from, apart from, in contrast with, notwithstanding, along with, together with, as opposed to, except for, instead of, depending on, in advance, along side, without, beyond, via, per, given, in light of, as a result of, owing to, other than...) thì BẮT BUỘC TRÍCH XUẤT VÀO NHÓM "prepositions" (CHỨ KHÔNG PHẢI "phrases").
ĐẶC BIỆT 1: NẾU có các cụm từ ghép, phrasal verbs, collocations (ví dụ: abide by, take care of, in charge of...) thì trích xuất vào nhóm "phrases", KHÔNG TÁCH RỜI.`;

c = c.replace(/Các giới từ \(in, on, at, of, with\.\.\.\) thì trích xuất vào nhóm "prepositions"\.\nĐẶC BIỆT 1: NẾU có các cụm từ ghép, phrasal verbs, collocations, hoặc cụm giới từ \(ví dụ: except for, abide by, take care of, in charge of\.\.\.\) thì trích xuất toàn bộ cụm đó vào nhóm "phrases", KHÔNG TÁCH RỜI\./, newPromptLine);

fs.writeFileSync('pga.html', c);
console.log('Update prompt success');
