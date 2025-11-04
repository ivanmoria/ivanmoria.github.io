/* ===== Dados musicais ===== */
const MAJOR_KEYS = ["C","G","D","A","E","B","F#","C#","G#","D#","A#","F"];
const MINOR_RELATIVES = ["Am","Em","Bm","F#m","C#m","G#m","D#m","A#m","Fm","Cm","Gm","Dm"];

// Cromático atualizado com todos os enarmônicos possíveis
const CHROMATIC = [
  {s:"C", f:"B#"}, {s:"C#", f:"Db"}, {s:"D", f:"D"}, {s:"D#", f:"Eb"},
  {s:"E", f:"Fb"}, {s:"F", f:"E#"}, {s:"F#", f:"Gb"}, {s:"G", f:"G"},
  {s:"G#", f:"Ab"}, {s:"A", f:"A"}, {s:"A#", f:"Bb"}, {s:"B", f:"Cb"}, {s:"B#", f:"C"}
];

const MODES = {
  major: [2,2,1,2,2,2,1],
  minor: [2,1,2,2,1,2,2],
  harmonicMinor: [2,1,2,2,1,3,1],
  melodicMinor: [2,1,2,2,2,2,1]
};

const DEGREE_LABELS_MAJOR = ["I","ii","iii","IV","V","vi","vii\u00B0"];
const DEGREE_LABELS_MINOR = ["i","ii\u00B0","III","iv","v","VI","VII"];

const MAJOR_ACCIDENTS = {"C":0,"G":1,"D":2,"A":3,"E":4,"B":5,"F#":6,"C#":7,"F":-1,"Bb":-2,"Eb":-3,"Ab":-4,"Db":-5,"Gb":-6,"Cb":-7};
const MINOR_ACCIDENTS = {"A":0,"E":1,"B":2,"F#":3,"C#":4,"G#":5,"D#":6,"A#":7,"D":-1,"G":-2,"C":-3,"F":-4,"Bb":-5,"Eb":-6,"Ab":-7};

/* ===== Funções auxiliares ===== */
function accidentCount(key, mode) {
  const map = mode.includes("minor") ? MINOR_ACCIDENTS : MAJOR_ACCIDENTS;
  const val = map[key] || 0;
  if(val>0) return {accidental:"♯", count:val};
  if(val<0) return {accidental:"♭", count:-val};
  return {accidental:null, count:0};
}

function findChromaticIndex(name) {
  const n = name.replace('♯','#').replace('♭','b');
  for(let i=0;i<CHROMATIC.length;i++){
    if(CHROMATIC[i].s===n || CHROMATIC[i].f===n) return i;
  }
  return -1;
}

function correctNoteForKey(note, useFlats){
  const idx = findChromaticIndex(note);
  if(idx===-1) return note;
  return useFlats ? CHROMATIC[idx].f : CHROMATIC[idx].s;
}

const LETTERS = ["C","D","E","F","G","A","B"];

/* ===== Função buildScale corrigida ===== */
function buildScale(root, modeName) {
  const pattern = MODES[modeName];
  const scale = [];
  const rootIdx = findChromaticIndex(root);
  let semitone = rootIdx;
  let letterIndex = LETTERS.indexOf(root[0]);

  scale.push(root); // adiciona a tônica

  for (let step of pattern) {
    semitone = (semitone + step) % 12;
    letterIndex = (letterIndex + 1) % 7;
    const expectedLetter = LETTERS[letterIndex];

    // procura cromático com letra correta e semitom exato
    let noteObj = CHROMATIC.find(n=>{
      const sIdx = findChromaticIndex(n.s);
      const fIdx = findChromaticIndex(n.f);
      return (n.s[0] === expectedLetter && sIdx === semitone) ||
             (n.f[0] === expectedLetter && fIdx === semitone);
    });

    // fallback: monta nota com ♯ ou ♭ para ajustar semitom
    if(!noteObj){
      let naturalIdx = findChromaticIndex(expectedLetter);
      let diff = (semitone - naturalIdx + 12) % 12;
      let note = expectedLetter;
      if(diff===1) note += '♯';
      else if(diff===2) note += '♯♯';
      else if(diff===11) note += '♭';
      else if(diff===10) note += '♭♭';
      scale.push(note);
    } else {
      scale.push(noteObj.s[0]===expectedLetter ? noteObj.s : noteObj.f);
    }
  }

  scale.pop(); // remove oitava repetida
  return scale;
}

/* ===== Constroi acordes de tétrade ===== */
function buildTetradFromScale(scale, degreeIndex){
  const root = scale[degreeIndex];
  const third = scale[(degreeIndex+2)%7];
  const fifth = scale[(degreeIndex+4)%7];
  const seventh = scale[(degreeIndex+6)%7];

  const rootIdx = findChromaticIndex(root);
  const thirdIdx = findChromaticIndex(third);
  const fifthIdx = findChromaticIndex(fifth);
  const seventhIdx = findChromaticIndex(seventh);

  const interval = (a,b)=>((b-a+12)%12);
  const thirdInt = interval(rootIdx, thirdIdx);
  const fifthInt = interval(rootIdx, fifthIdx);
  const seventhInt = interval(rootIdx, seventhIdx);

  let triadLabel="";
  if(thirdInt===4 && fifthInt===7) triadLabel="";       
  else if(thirdInt===3 && fifthInt===7) triadLabel="m"; 
  else if(thirdInt===3 && fifthInt===6) triadLabel="°"; 
  else if(thirdInt===4 && fifthInt===8) triadLabel="aug"; 

  let seventhLabel="";
  if(selectedMode==="harmonicMinor" && degreeIndex===4){ 
      triadLabel=""; 
      seventhLabel="7"; 
  } else {
      if(triadLabel==="") seventhLabel=(seventhInt===11)?"maj7":"7";
      else if(triadLabel==="m") seventhLabel="m7";
      else if(triadLabel==="°") seventhLabel="m7b5";
      else seventhLabel="7";
  }

  let chordName = root;
  if(triadLabel!=="") chordName += triadLabel;
  chordName += seventhLabel;

  const notes = [root,third,fifth,seventh].map(n=>{
    const acc = accidentCount(n, selectedMode);
    return correctNoteForKey(n, acc.accidental==='♭');
  });

  return {name:chordName, notes};
}

/* ===== UI e renderização ===== */
const circleContainer=document.getElementById('circleContainer');
const modeSelect=document.getElementById('modeSelect');
const regenBtn=document.getElementById('regen');
const scaleNotesDiv=document.getElementById('scaleNotes');
const chordsGrid=document.getElementById('chordsGrid');

let selectedKey="C";
let selectedMode=modeSelect.value;

/* ===== Desenha círculo de notas ===== */
function drawCircle(){
  circleContainer.innerHTML='';
  const rect = circleContainer.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const outerR = rect.width * 0.4;
  const innerR = rect.width * 0.25;
  const btnSize = rect.width < 350 ? 40 : 65;

  for(let i=0;i<12;i++){
    const angle=(i/12)*2*Math.PI - Math.PI/2;

    // Major
    const major=document.createElement('button');
    major.className='note-btn major';
    major.style.width = major.style.height = btnSize+'px';
    major.style.left=`${cx + outerR*Math.cos(angle) - btnSize/2}px`;
    major.style.top=`${cy + outerR*Math.sin(angle) - btnSize/2}px`;
    const acc = accidentCount(MAJOR_KEYS[i],'major');
    major.textContent = correctNoteForKey(MAJOR_KEYS[i], acc.accidental==='♭');
    major.onclick=()=>{
      selectedKey=MAJOR_KEYS[i];
      selectedMode='major';
      modeSelect.value='major';
      renderAll();
    };
    circleContainer.appendChild(major);

    // Minor
    const minor=document.createElement('button');
    minor.className='note-btn minor';
    minor.style.width = minor.style.height = btnSize+'px';
    minor.style.left=`${cx + innerR*Math.cos(angle) - btnSize/2}px`;
    minor.style.top=`${cy + innerR*Math.sin(angle) - btnSize/2}px`;
    const accMinor = accidentCount(MINOR_RELATIVES[i].replace(/m$/,''),'minor');
    minor.textContent = correctNoteForKey(MINOR_RELATIVES[i].replace(/m$/,''), accMinor.accidental==='♭')+'m';
    minor.onclick=()=>{
      selectedKey=MINOR_RELATIVES[i].replace(/m$/,'');
      if(!["minor","harmonicMinor","melodicMinor"].includes(selectedMode)){
        selectedMode='minor';
        modeSelect.value='minor';
      } else {
        modeSelect.value=selectedMode;
      }
      renderAll();
    };
    circleContainer.appendChild(minor);
  }

  highlightActive();
}

/* ===== Destaca nota selecionada ===== */
function highlightActive(){
  document.querySelectorAll('.note-btn').forEach(b=>b.classList.remove('active'));
  if(selectedMode==='major'){
    document.querySelectorAll('.note-btn.major').forEach(btn=>{
      if(btn.textContent.replace(/[♯♭]/,'')===selectedKey) btn.classList.add('active');
    });
  } else {
    document.querySelectorAll('.note-btn.minor').forEach(btn=>{
      if(btn.textContent.replace(/[♯♭m]/,'')===selectedKey) btn.classList.add('active');
    });
  }
}

/* ===== Renderização de abas e cadências ===== */
function renderProgressionTab(){
  const container = document.getElementById('progression');
  container.innerHTML = '';
  for(let col of chordsGrid.children){
    const card = document.createElement('div');
    card.className='cadence-card';
    const chordName = col.querySelector('.chordname').textContent;
    const chordNotes = col.querySelector('.noteslist').textContent;
    card.textContent = chordName + ' (' + chordNotes + ')';
    container.appendChild(card);
  }
}

function renderCadencesTab(scale){
  const container = document.getElementById('cadences');
  container.innerHTML = '';
  const cadences = [
    {name:"Autêntica (V–I)", degrees:[4,0]},
    {name:"Plagal (IV–I)", degrees:[3,0]},
    {name:"Dominante secundária (V/V → V → I)", degrees:['V/V',4,0]}
  ];

  cadences.forEach(cad=>{
    const card = document.createElement('div');
    card.className='cadence-card';
    const title = document.createElement('strong');
    title.textContent = cad.name + ': ';
    card.appendChild(title);

    const notesRow = document.createElement('div');
    notesRow.className='notes-row';

    cad.degrees.forEach(d=>{
      let chord;
      if(d==='V/V'){
        const V_degree = 4;
        const V_chord = buildTetradFromScale(scale,V_degree);
        const V_root = V_chord.notes[0];
        const V_scale = buildScale(V_root,selectedMode);
        chord = buildTetradFromScale(V_scale,4);
      } else {
        chord = buildTetradFromScale(scale,d);
      }
      const chordDiv = document.createElement('div');
      chordDiv.className='note';
      chordDiv.textContent = chord.name;
      notesRow.appendChild(chordDiv);
    });

    card.appendChild(notesRow);
    container.appendChild(card);
  });
}

/* ===== Renderização principal ===== */
function renderAll(){
  scaleNotesDiv.innerHTML='';
  chordsGrid.innerHTML='';

  const scale = buildScale(selectedKey, selectedMode);

  // Escala principal
  const acc = accidentCount(selectedKey, selectedMode);
  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'scale-wrapper';
  scaleNotesDiv.appendChild(mainWrapper);

  const mainRowLabel = document.createElement('div');
  mainRowLabel.className = 'scale-label';
  mainRowLabel.textContent = `${selectedKey} — ${modeSelect.options[modeSelect.selectedIndex].text}` +
                              (acc.count>0 ? ` (${acc.count} ${acc.accidental})` : '');
  mainWrapper.appendChild(mainRowLabel);

  const notesRowMain = document.createElement('div');
  notesRowMain.className = 'notes';
  scale.forEach(n=>{
    const el = document.createElement('div');
    el.className = 'note';
    el.textContent = n;
    notesRowMain.appendChild(el);
  });
  mainWrapper.appendChild(notesRowMain);

  // Escala enarmônica
  const showAlt = ["C#","D#","F#","G#","A#","Db","Eb","Gb","Ab","Bb"].includes(selectedKey);
  if(showAlt){
    const idx = findChromaticIndex(selectedKey);
    const altKey = (CHROMATIC[idx].s === selectedKey) ? CHROMATIC[idx].f : CHROMATIC[idx].s;
    const altScale = buildScale(altKey, selectedMode);

    const altWrapper = document.createElement('div');
    altWrapper.className = 'scale-wrapper';
    scaleNotesDiv.appendChild(altWrapper);

    const altRowLabel = document.createElement('div');
    altRowLabel.className = 'scale-label';
    const accAlt = accidentCount(altKey, selectedMode);
    altRowLabel.textContent = `${altKey} — ${modeSelect.options[modeSelect.selectedIndex].text}` +
                               (accAlt.count>0 ? ` (${accAlt.count} ${accAlt.accidental})` : '');
    altWrapper.appendChild(altRowLabel);

    const notesRowAlt = document.createElement('div');
    notesRowAlt.className = 'notes';
    altScale.forEach(n=>{
      const el = document.createElement('div');
      el.className = 'note alt';
      el.textContent = n;
      notesRowAlt.appendChild(el);
    });
    altWrapper.appendChild(notesRowAlt);
  }

  // Acordes diatônicos
  const degreeLabels = selectedMode.includes('minor') ? DEGREE_LABELS_MINOR : DEGREE_LABELS_MAJOR;
  for(let d=0; d<7; d++){
    const col = document.createElement('div'); col.className='col';
    const degree = document.createElement('div'); degree.className='hdr'; degree.textContent = degreeLabels[d];

    const chord = buildTetradFromScale(scale,d);
    const chordNameDiv = document.createElement('div'); chordNameDiv.className='chordname'; chordNameDiv.textContent = chord.name;
    const notesDiv = document.createElement('div'); notesDiv.className='noteslist'; notesDiv.textContent = chord.notes.join(' - ');

    col.appendChild(degree);
    col.appendChild(chordNameDiv);
    col.appendChild(notesDiv);

    chordsGrid.appendChild(col);
  }

  renderProgressionTab();
  renderCadencesTab(scale);
  highlightActive();
}

/* ===== Listeners e inicialização ===== */
modeSelect.addEventListener('change',()=>{
  selectedMode=modeSelect.value;
  renderAll();
});
regenBtn.addEventListener('click',()=>renderAll());

document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.style.display='none');
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).style.display='block';
  });
});

drawCircle();
renderAll();
