const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

let oldPromptLine = `ĐẶC BIỆT 3: Các từ/cụm từ mang tính chất nối câu sau đây BẮT BUỘC xếp vào nhóm "conjunctions" (Liên từ): however, meanwhile, instead, if so, moreover, furthermore, therefore, thus, besides, in addition, otherwise, then, nevertheless, on the other hand, in fact, finally, ultimately, likewise, similarly, nonetheless, consequently, as a consequence, subsequently, meantime, accordingly, after all, even so, conversely, so far, before long, as a result, to this end, as such, hence, at once, on the contrary, while, beforehand, in advance.`;

let newPromptLine = `ĐẶC BIỆT 3: Đối với các từ (however, meanwhile, instead, if so, moreover, furthermore, therefore, thus, besides, in addition, otherwise, then, nevertheless, on the other hand, in fact, finally, ultimately, likewise, similarly, nonetheless, consequently, as a consequence, subsequently, meantime, accordingly, after all, even so, conversely, so far, before long, as a result, to this end, as such, hence, at once, on the contrary, while, beforehand, in advance...), HÃY XÉT NGỮ CẢNH: Nếu phía sau chúng là một mệnh đề (clause) hoặc chúng đóng vai trò nối các câu/mệnh đề lại với nhau thì mới xếp vào nhóm "conjunctions" (Liên từ). Còn nếu không, hãy xếp vào trạng từ hoặc giới từ tuỳ ngữ cảnh.`;

c = c.replace(oldPromptLine, newPromptLine);

fs.writeFileSync('pga.html', c);
console.log('Update prompt success for contextual conjunctions');
