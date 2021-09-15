export function truncate(input, length, append = '...') {
    if(input.length > length)
       return input.substring(0, length)+append;
    return input;
};