const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

let newPromptLine = `ĐẶC BIỆT 2: NẾU là DANH TỪ GHÉP (Compound Nouns) tạo từ 2 danh từ trở lên (ví dụ: assembly line, filing cabinet, wooden crate...) thì trích xuất NGUYÊN CỤM ĐÓ vào nhóm "nouns" chứ ĐỪNG TÁCH THÀNH 2 TỪ ĐƠN.
ĐẶC BIỆT 3: Các từ/cụm từ mang tính chất nối câu sau đây BẮT BUỘC xếp vào nhóm "conjunctions" (Liên từ): however, meanwhile, instead, if so, moreover, furthermore, therefore, thus, besides, in addition, otherwise, then, nevertheless, on the other hand, in fact, finally, ultimately, likewise, similarly, nonetheless, consequently, as a consequence, subsequently, meantime, accordingly, after all, even so, conversely, so far, before long, as a result, to this end, as such, hence, at once, on the contrary, while, beforehand, in advance.`;

c = c.replace(/ĐẶC BIỆT 2: NẾU là DANH TỪ GHÉP \(Compound Nouns\) tạo từ 2 danh từ trở lên \(ví dụ: assembly line, filing cabinet, wooden crate\.\.\.\) thì trích xuất NGUYÊN CỤM ĐÓ vào nhóm "nouns" chứ ĐỪNG TÁCH THÀNH 2 TỪ ĐƠN\./, newPromptLine);

fs.writeFileSync('pga.html', c);
console.log('Update prompt success for conjunctions');
