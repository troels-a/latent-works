const Verify = function(network){

    const self = {};

    self.network = network;
    self.command = '';

    self.add = function(address, args = []){

        self.command += `npx hardhat verify --network ${self.network} ${address}`;
        
        if(args){
            for (let i = 0; i < args.length; i++) {
                self.command += ` "${args[i]}"`;
                
            }
        }

        self.command += ';';

    }

    return self;

}

module.exports = Verify