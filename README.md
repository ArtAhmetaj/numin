# Numin

Numin is a Typescript project in which a dynamic interpreted language with a tree walk interpreter is implented.
The language is implemented step by step including a: scanner, parser, resolver and interpreter and the funcionality is connected through the visitor pattern with a Object oriented aproach within the project.

## Installation

To install this project you will need the [Node JS Runtime](https://nodejs.org/en/) along with its package manager called [npm](https://www.npmjs.com/)

After that you will need to clone the project locally 

```bash
git clone git@github.com:ArtAhmetaj/numin.git
```

After cloning the project you will need to install all dependencies required in the project with:
```bash
npm install
```

Compiling the project will need a global install of typescript 

```bash
npm i -g typescript
```
in which the command "npx tsc" or "npm run buil" will build the project.


## Usage

Using the library is as simple as building it and running it through a file with matching syntax.

```bash
node numin <filename>
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)



## BNF Notation

Below is the bnf notation of the language presented in the albanian language for the terminal and non terminal productions:

```bash
shprehje → detyrë ;

detyrë → ( thirrje "." )? IDENTIFIKUES "=" detyrë
                | logjika_ose ;

logjika_ose → logjika_dhe ("ose" logjika_dhe )* ;
logjika_dhe → barazi ("dhe" barazi)* ;
barazi → krahasim ( ( "!=" | "==") krahasimi)* ;
krahasimi → termi ( ( ">" | ">=" | "<" | "<=" ) term )* ;
termi → faktori ( ( "-" | "+" ) faktori )* ;
faktori → unar (("/" | "*") unar)*;

unar → ( "!" | "-" ) unar | thirrje ;
thirrje → primar ( "(" argumente? ")" | "." IDENTIFIKUES )* ;
primar → "e vërtetë" | "e rreme" | "nuk" | "kjo"
                | NUMRI | STRING | IDENTIFIKUES | "(" shprehje ")"
                | "super" "." IDENTIFIKUES ;



program → deklaratë* EOF ;
deklaratë → shprehje deklarimi
|printim;
shprehje deklarimi→ shprehja ";" ;
printim → shprehja "print" ";" ;



shprehje → caktim ;
caktim → IDENTIFIKUES "=" caktim | barazi ;


deklarim → Deklarim i klases 
| Deklarim i funksionit
| Deklarim i variables
| Deklarim ;
Deklarim i klases→ "class" IDENTIFIKUES "{" funksion* "}" ;
```