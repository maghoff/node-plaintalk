function findFirstOf(data, chars) {
	var nums = [];
	var i, j;

	for (i = 0; i < chars.length; ++i) nums.push(chars.charCodeAt(i) & 0xFF);

	for (i = 0; i < data.length; ++i) {
		var char = data[i];
		for (j = 0; j < nums.length; ++j) {
			if (char === nums[j]) return i;
		}
	}

	return data.length;
}

module.exports = {
    findFirstOf,
};
