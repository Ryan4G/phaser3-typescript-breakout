const fisher_yates_shuffle = (arr: Array<number>) => {
    for(let j = arr.length - 1; j > 0; j--){
        
        let rand = Math.floor(Math.random() * (j + 1));

        let tmp = arr[j];

        arr[j] = arr[rand];

        arr[rand] = tmp;
    }
};

export default fisher_yates_shuffle;