// export const ERROR_REGEX = /'(NOT_HOLDER)'/gm
// export const ERROR_MESSAGES = {
//      'COMP_CREATOR': 'Creator can not mint'
// }

export function errToMessage(error){
    // const matches = [...error.matchAll(ERROR_REGEX)];
    // if(matches)
    //     return ERROR_MESSAGES[matches[0][1].trim()];
    console.log(error)
    return ':( Error'
}