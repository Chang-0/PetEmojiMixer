import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import './App.css';

interface EmojiItem {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const PET_BASES = [
  { id: 'cat', name: '🐱 Cat', emoji: '🐱' },
  { id: 'dog', name: '🐶 Dog', emoji: '🐶' },
  { id: 'rabbit', name: '🐰 Rabbit', emoji: '🐰' },
  { id: 'bear', name: '🐻 Bear', emoji: '🐻' },
  { id: 'panda', name: '🐼 Panda', emoji: '🐼' },
];

const EMOJI_LIST = [
  '🕶️', '👑', '❤️', '🔥', '✨', '🎀', '🎓', '🍕', '🍦', '🎈', '🎸', '🎮', '💡'
];

const URLImage = ({ item, isSelected, onSelect, onChange }: { 
  item: EmojiItem; 
  isSelected: boolean; 
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}) => {
  // We use text as image for now because downloading icons is hard in this environment.
  // Actually, Konva can render text. But the prompt said "Pet-Emoji Mixer".
  // Let's use a trick: render the emoji to a hidden canvas and use it as an image source.
  const [image] = useImage(`https://openmoji.org/data/color/svg/${item.url}.svg`, 'anonymous');
  
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...item}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

// Helper to convert emoji to OpenMoji hex format
const emojiToHex = (emoji: string) => {
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toUpperCase());
  return codePoints.join('-');
};

function App() {
  const [selectedPet, setSelectedPet] = useState(PET_BASES[0]);
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [selectedId, selectShape] = useState<string | null>(null);
  const stageRef = useRef<any>(null);

  const [petImage] = useImage(`https://openmoji.org/data/color/svg/${emojiToHex(selectedPet.emoji)}.svg`);

  const addEmoji = (emoji: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newEmoji: EmojiItem = {
      id,
      url: emojiToHex(emoji),
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
    };
    setEmojis([...emojis, newEmoji]);
    selectShape(id);
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'pet-emoji-mixer.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const handleSave = async () => {
    const composition = {
      name: `My ${selectedPet.name} Mix`,
      petBaseId: selectedPet.id,
      emojiItemsJson: JSON.stringify(emojis)
    };
    try {
      const response = await fetch('/api/compositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composition),
      });
      if (response.ok) {
        alert('Saved successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save to backend. Make sure the Spring Boot app is running on port 8080.');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🐾 Pet-Emoji Mixer</h1>
        <div className="actions">
          <button onClick={handleSave}>💾 Save</button>
          <button onClick={handleExport} className="export-btn">📸 Export PNG</button>
        </div>
      </header>
      
      <main className="main-content">
        <aside className="sidebar left">
          <section className="section">
            <h3>Choose Pet</h3>
            <div className="grid">
              {PET_BASES.map(pet => (
                <button 
                  key={pet.id} 
                  className={`item-btn ${selectedPet.id === pet.id ? 'active' : ''}`}
                  onClick={() => setSelectedPet(pet)}
                >
                  <span className="emoji-large">{pet.emoji}</span>
                  <span>{pet.name}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <div className="canvas-area">
          <div className="stage-wrapper">
            <Stage
              width={500}
              height={500}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
              ref={stageRef}
              className="konva-stage"
            >
              <Layer>
                {/* Background / Base Pet */}
                <KonvaImage
                  image={petImage}
                  width={400}
                  height={400}
                  x={50}
                  y={50}
                />
                
                {/* Emojis */}
                {emojis.map((item, i) => (
                  <URLImage
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedId}
                    onSelect={() => selectShape(item.id)}
                    onChange={(newAttrs) => {
                      const newEmojis = emojis.slice();
                      newEmojis[i] = newAttrs;
                      setEmojis(newEmojis);
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
          <div className="hints">
            Drag to move • Resize with handles • Click empty area to deselect
          </div>
        </div>

        <aside className="sidebar right">
          <section className="section">
            <h3>Add Emojis</h3>
            <div className="emoji-grid">
              {EMOJI_LIST.map(emoji => (
                <button 
                  key={emoji} 
                  className="emoji-btn"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </section>
          {selectedId && (
            <button 
              className="delete-btn"
              onClick={() => {
                setEmojis(emojis.filter(e => e.id !== selectedId));
                selectShape(null);
              }}
            >
              🗑️ Delete Selected
            </button>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
