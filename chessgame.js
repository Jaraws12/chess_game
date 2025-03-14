//const { render } = require("ejs");

const socket = io();
const chess=new Chess();
const boardElement=document.querySelector(".chessboard");

let draggedPiece=null;
let SourceSquare=null;
let playerRole=null;

const renderBoard=()=>{
  const board=chess.board();
  boardElement.innerHTML="";
  board.forEach((row,rowindex)=>{
      row.forEach((square,squareindex)=>{
   const SquareElement=document.createElement("div");
   SquareElement.classList.add("square",
    (rowindex+squareindex)%2==0? "light":"dark"
);
   SquareElement.dataset.row=rowindex;
   SquareElement.dataset.col=squareindex;
     if(square){
        const pieceElement=document.createElement("div");
        pieceElement.classList.add("piece", square.color==="w"? "white":"black");
        pieceElement.innerText=getPieceunicode(square);
        pieceElement.draggable=playerRole===square.color;
        pieceElement.addEventListener("dragstart",(e)=>{
            if(pieceElement.draggable){
                draggedPiece=pieceElement;
                SourceSquare={row:rowindex,col:squareindex}
                e.dataTransfer.setData("text/plain","");

            }
        });
        pieceElement.addEventListener("dragend",(e)=>{
            draggedPiece=null;
            SourceSquare=null;

        });
        SquareElement.appendChild(pieceElement)
     }

     SquareElement.addEventListener("dragover",(e)=>{
      e.preventDefault();

     });
     SquareElement.addEventListener("drop",(e)=>{
        e.preventDefault();
        if(draggedPiece){
            const targetSource={
                row:parseInt(SquareElement.dataset.row),
                col:parseInt(SquareElement.dataset.col),
            }
            handelMove(SourceSquare,targetSource);

        }
     });
      
     boardElement.appendChild(SquareElement);   
      });
     

  });

  if(playerRole==="b"){
    boardElement.classList.add("flipped");

  }
  else{
    boardElement.classList.remove("flipped");
  }
  

    
  };


const handelMove=(source,target)=>{
  const move={
    from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
    to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
    promotion:"q",
  }
  socket.emit("move",move);

}

const getPieceunicode=(piece)=>{
    const unicodePieces={
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♙",
        R:"♖",
        N:"♘",
        B:"♗",
        Q:"♕",
        K:"♔",
    };

    return unicodePieces[piece.type]||"";

    
};

socket.on("playerRole",(role)=>{
    playerRole=role;
    renderBoard();


});
socket.on("spectatorRole",()=>{
    playerRole=null;
    renderBoard();

});
socket.on("boardState",(fen)=>{
    chess.load(fen);
    renderBoard();

});

socket.on("boardState",(move)=>{
    chess.move(move);
    renderBoard();
    
})
renderBoard();


