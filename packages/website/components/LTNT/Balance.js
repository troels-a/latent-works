import { useLTNT } from './Provider';

export default function Balance(p){

    const LTNT = useLTNT()
    return <span {...p}>{LTNT.balance > 0 && LTNT.balance}</span>

}