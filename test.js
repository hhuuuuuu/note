var intersect = function(nums1, nums2) {
    const len1 = nums1.length;
    const map = {};
    const result = [];
    for (let i = 0; i < len1; i ++){
        const val = nums1[i];
        map[val] = map[val] !== undefined ? map[val] + 1 : 1;
    }
    
    Object.keys(map).forEach(key => {
        const intKey = Number(key);
        const val1 = map[key];
        const val2 = nums2.filter(item => {
            return item === intKey;
        }).length;
        console.log(val1, val2)
        const val = val2 && (val2 > val1 ?  val1 : val2);
        if(val){
            for (let i = 0; i < val; i++){
                result.push(intKey)
            }
        }
    });
    console.log(result)
    
    return result;
};

intersect([4, 9 ,5], [9, 4, 9, 8,4])