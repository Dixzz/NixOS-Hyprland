{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    #nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    niri.url = "path:/home/fed/niri-flake";
    #niri.url = "github:sodiboo/niri-flake";

    noctalia = {
      url = "github:noctalia-dev/noctalia-shell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
niri-nix = {
  url = "git+https://codeberg.org/BANanaD3V/niri-nix";
};
  };

  outputs = { self, nixpkgs, niri, niri-nix, noctalia,  ... }:
  {
    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      #specialArgs = { inherit niri-nix; };
    
      modules = [
        ./configuration.nix
        #niri-nix.nixosModules.default
	noctalia.nixosModules.default
	niri.nixosModules.niri
      ];
    };
  };
}
