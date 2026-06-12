const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const VAR_BLOCKS = {
  'forward:': {opcode: 'motion_movesteps', args: [{name: 'STEPS', type: 'input'}]},
  'turnRight:': {opcode: 'motion_turnright', args: [{name: 'DEGREES', type: 'input'}]},
  'turnLeft:': {opcode: 'motion_turnleft', args: [{name: 'DEGREES', type: 'input'}]},
  'pointInDirection:': {opcode: 'motion_pointindirection', args: [{name: 'DIRECTION', type: 'input'}]},
  'pointTowards:': {opcode: 'motion_pointtowards', args: [{name: 'TOWARDS', type: 'input'}]},
  'gotoX:y:': {opcode: 'motion_gotoxy', args: [{name: 'X', type: 'input'}, {name: 'Y', type: 'input'}]},
  'glideSecs:toX:y:elapsed:from:': {opcode: 'motion_glidesecstoxy', args: [{name: 'SECS', type: 'input'}, {name: 'X', type: 'input'}, {name: 'Y', type: 'input'}]},
  'changeX:by:': {opcode: 'motion_changexby', args: [{name: 'DX', type: 'input'}]},
  'changeY:by:': {opcode: 'motion_changeyby', args: [{name: 'DY', type: 'input'}]},
  'setX:': {opcode: 'motion_setx', args: [{name: 'X', type: 'input'}]},
  'setY:': {opcode: 'motion_sety', args: [{name: 'Y', type: 'input'}]},
  'ifOnEdgeBounce': {opcode: 'motion_ifonedgebounce', args: []},
  'setRotationStyle': {opcode: 'motion_setrotationstyle', args: [{name: 'STYLE', type: 'input'}]},
  'say:duration:elapsed:from:': {opcode: 'looks_sayforsecs', args: [{name: 'MESSAGE', type: 'input'}, {name: 'SECS', type: 'input'}]},
  'say:': {opcode: 'looks_say', args: [{name: 'MESSAGE', type: 'input'}]},
  'think:duration:elapsed:from:': {opcode: 'looks_thinkforsecs', args: [{name: 'MESSAGE', type: 'input'}, {name: 'SECS', type: 'input'}]},
  'think:': {opcode: 'looks_think', args: [{name: 'MESSAGE', type: 'input'}]},
  'switchCostumeTo:': {opcode: 'looks_switchcostumeto', args: [{name: 'COSTUME', type: 'input'}]},
  'nextCostume': {opcode: 'looks_nextcostume', args: []},
  'startScene': {opcode: 'looks_switchbackdropto', args: [{name: 'BACKDROP', type: 'input'}]},
  'changeGraphicEffect:by:': {opcode: 'looks_changeeffectby', args: [{name: 'EFFECT', type: 'input'}, {name: 'CHANGE', type: 'input'}]},
  'setGraphicEffect:to:': {opcode: 'looks_seteffectto', args: [{name: 'EFFECT', type: 'input'}, {name: 'VALUE', type: 'input'}]},
  'show': {opcode: 'looks_show', args: []},
  'hide': {opcode: 'looks_hide', args: []},
  'wait:elapsed:from:': {opcode: 'control_wait', args: [{name: 'DURATION', type: 'input'}]},
  'repeat:': {opcode: 'control_repeat', args: [{name: 'TIMES', type: 'input'}, {name: 'SUBSTACK', type: 'substack'}]},
  'forever': {opcode: 'control_forever', args: [{name: 'SUBSTACK', type: 'substack'}]},
  'if': {opcode: 'control_if', args: [{name: 'CONDITION', type: 'input'}, {name: 'SUBSTACK', type: 'substack'}]},
  'ifElse': {opcode: 'control_if_else', args: [{name: 'CONDITION', type: 'input'}, {name: 'SUBSTACK', type: 'substack'}, {name: 'SUBSTACK2', type: 'substack'}]},
  'stopScripts': {opcode: 'control_stop', args: [{name: 'STOP_OPTION', type: 'input'}]},
  'broadcast:': {opcode: 'event_broadcast', args: [{name: 'BROADCAST_INPUT', type: 'input'}]},
  'broadcastAndWait:': {opcode: 'event_broadcastandwait', args: [{name: 'BROADCAST_INPUT', type: 'input'}]},
  'whenGreenFlag': {opcode: 'event_whenflagclicked', args: []},
  'whenKeyPressed': {opcode: 'event_whenkeypressed', args: [{name: 'KEY_OPTION', type: 'input'}]},
  'whenClicked': {opcode: 'event_whenthisspriteclicked', args: []},
  'whenSceneStarts': {opcode: 'event_whenbackdropswitchesto', args: [{name: 'BACKDROP', type: 'input'}]},
  'playSound:': {opcode: 'sound_play', args: [{name: 'SOUND_MENU', type: 'input'}]},
  'playSoundAndWait:': {opcode: 'sound_playuntildone', args: [{name: 'SOUND_MENU', type: 'input'}]},
  'stopAllSounds': {opcode: 'sound_stopallsounds', args: []},
  'setVar:to:': {opcode: 'data_setvariableto', args: [{name: 'VARIABLE', type: 'field'}, {name: 'VALUE', type: 'input'}]},
  'changeVar:by:': {opcode: 'data_changevariableby', args: [{name: 'VARIABLE', type: 'field'}, {name: 'VALUE', type: 'input'}]},
  'showVariable:': {opcode: 'data_showvariable', args: [{name: 'VARIABLE', type: 'field'}]},
  'hideVariable:': {opcode: 'data_hidevariable', args: [{name: 'VARIABLE', type: 'field'}]},
  'add:toList:': {opcode: 'data_addtolist', args: [{name: 'LIST', type: 'field'}, {name: 'ITEM', type: 'input'}]},
  'deleteLine:ofList:': {opcode: 'data_deleteoflist', args: [{name: 'INDEX', type: 'input'}, {name: 'LIST', type: 'field'}]},
  'insert:at:ofList:': {opcode: 'data_insertatlist', args: [{name: 'ITEM', type: 'input'}, {name: 'INDEX', type: 'input'}, {name: 'LIST', type: 'field'}]},
  'replaceLine:ofList:with:': {opcode: 'data_replaceitemoflist', args: [{name: 'INDEX', type: 'input'}, {name: 'LIST', type: 'field'}, {name: 'ITEM', type: 'input'}]},
  'showList:': {opcode: 'data_showlist', args: [{name: 'LIST', type: 'field'}]},
  'hideList:': {opcode: 'data_hidelist', args: [{name: 'LIST', type: 'field'}]},
  'contentsOfList:': {opcode: 'data_listcontents', args: [{name: 'LIST', type: 'field'}]},
  'lengthOfList:': {opcode: 'data_listlength', args: [{name: 'LIST', type: 'field'}]},
  'readVariable': {opcode: 'data_variable', args: [{name: 'VARIABLE', type: 'field'}]},
};

let blockIdCounter = 0;
function makeId(prefix = 'b') {
  blockIdCounter += 1;
  return `${prefix}${Date.now().toString(36)}${blockIdCounter}`;
}

function createShadow(value) {
  const id = makeId('s');
  const isNumber = typeof value === 'number' || (!Number.isNaN(Number(value)) && value !== '');
  const opcode = isNumber ? 'math_number' : 'text';
  return {
    id,
    opcode,
    next: null,
    parent: null,
    inputs: {},
    fields: isNumber ? {NUM: [value.toString()]} : {TEXT: [value.toString()]},
    topLevel: false,
    x: null,
    y: null,
    shadow: true,
  };
}

function createFieldBlock(value, fieldName = 'VARIABLE') {
  return {
    id: makeId('f'),
    opcode: 'data_variable',
    next: null,
    parent: null,
    inputs: {},
    fields: {[fieldName]: [value.toString()]},
    topLevel: false,
    x: null,
    y: null,
    shadow: true,
  };
}

function createBlock(opcode, parent = null) {
  return {
    id: makeId('b'),
    opcode,
    next: null,
    parent,
    inputs: {},
    fields: {},
    topLevel: false,
    x: null,
    y: null,
    shadow: false,
  };
}

function isBlockArray(item) {
  return Array.isArray(item) && item.length > 0 && typeof item[0] === 'string';
}

function convertBlock(sb2Block, parent = null, allBlocks = []) {
  if (!Array.isArray(sb2Block)) {
    const shadow = createShadow(sb2Block);
    allBlocks.push(shadow);
    return shadow;
  }

  const opcodeEntry = VAR_BLOCKS[sb2Block[0]];
  if (!opcodeEntry) {
    const fallback = createBlock('unsupported_scratch_block', parent);
    fallback.fields = {TEXT: [sb2Block[0].toString()]};
    allBlocks.push(fallback);
    return fallback;
  }

  const block = createBlock(opcodeEntry.opcode, parent);
  allBlocks.push(block);

  const args = sb2Block.slice(1);
  opcodeEntry.args.forEach((argSpec, index) => {
    const argValue = args[index];
    if (argValue === undefined) return;

    if (argSpec.type === 'field') {
      const fieldValue = argValue && typeof argValue === 'string' ? argValue : String(argValue);
      block.fields[argSpec.name] = [fieldValue];
      return;
    }

    if (argSpec.type === 'input') {
      if (isBlockArray(argValue)) {
        const child = convertBlock(argValue, block.id, allBlocks);
        block.inputs[argSpec.name] = [1, child.id];
        return;
      }
      if (Array.isArray(argValue) && argValue.length === 0) {
        return;
      }
      const shadow = createShadow(argValue);
      shadow.parent = block.id;
      allBlocks.push(shadow);
      block.inputs[argSpec.name] = [1, shadow.id];
      return;
    }

    if (argSpec.type === 'substack') {
      if (Array.isArray(argValue)) {
        const stack = convertScriptStack(argValue, block.id, allBlocks);
        block.inputs[argSpec.name] = [1, stack ? stack.id : null];
      }
    }
  });

  return block;
}

function convertScriptStack(stack, parent, allBlocks) {
  if (!Array.isArray(stack)) return null;
  let root = null;
  let previous = null;
  for (const item of stack) {
    if (!isBlockArray(item)) continue;
    const block = convertBlock(item, parent, allBlocks);
    if (!root) root = block;
    if (previous) previous.next = block.id;
    previous = block;
  }
  return root;
}

function convertScripts(sb2Scripts, allBlocks) {
  const blocks = {};
  for (const script of sb2Scripts || []) {
    if (!Array.isArray(script)) continue;
    const [x = 0, y = 0, scriptBlocks] = script;
    const rootBlock = convertScriptStack(scriptBlocks, null, allBlocks);
    if (!rootBlock) continue;
    rootBlock.topLevel = true;
    rootBlock.x = Number(x) || 0;
    rootBlock.y = Number(y) || 0;
    rootBlock.parent = null;
  }

  for (const block of allBlocks) {
    blocks[block.id] = block;
  }
  return blocks;
}

function convertVariables(variables) {
  const result = {};
  for (const variable of variables || []) {
    if (!Array.isArray(variable)) continue;
    const [id, name, value] = variable;
    result[id] = [name, value];
  }
  return result;
}

function convertLists(lists) {
  const result = {};
  for (const list of lists || []) {
    if (!Array.isArray(list)) continue;
    const [id, name, contents] = list;
    result[id] = [name, Array.isArray(contents) ? contents : []];
  }
  return result;
}

function convertBroadcasts(broadcasts) {
  const result = {};
  for (const name of broadcasts || []) {
    if (typeof name !== 'string') continue;
    const id = makeId('br');
    result[id] = [name, name];
  }
  return result;
}

function convertTarget(sb2Obj, globalBroadcasts) {
  const allBlocks = [];
  const target = {
    id: makeId('t'),
    name: sb2Obj.name || 'Sprite',
    isStage: Boolean(sb2Obj.isStage),
    variables: convertVariables(sb2Obj.variables),
    lists: convertLists(sb2Obj.lists),
    broadcasts: globalBroadcasts,
    blocks: {},
    currentCostume: sb2Obj.currentCostume || 0,
    costumes: (sb2Obj.costumes || []).map(costume => ({
      assetId: costume.assetId || costume.md5 || '',
      md5ext: costume.md5 ? `${costume.md5}.${costume.dataFormat || 'png'}` : '',
      name: costume.name || '',
      dataFormat: costume.dataFormat || 'png',
      rotationCenterX: costume.rotationCenterX || 0,
      rotationCenterY: costume.rotationCenterY || 0,
    })),
    sounds: (sb2Obj.sounds || []).map(sound => ({
      assetId: sound.assetId || sound.md5 || '',
      md5ext: sound.md5 ? `${sound.md5}.${sound.dataFormat || 'wav'}` : '',
      name: sound.name || '',
      dataFormat: sound.dataFormat || 'wav',
      format: sound.dataFormat || 'wav',
      rate: sound.rate || 44100,
      sampleCount: sound.sampleCount || 0,
    })),
    volume: sb2Obj.volume != null ? sb2Obj.volume : 100,
    layerOrder: sb2Obj.order || 0,
    visible: sb2Obj.visible != null ? sb2Obj.visible : true,
    x: sb2Obj.x || 0,
    y: sb2Obj.y || 0,
    direction: sb2Obj.direction || 90,
    draggable: sb2Obj.draggable || false,
    rotationStyle: sb2Obj.rotationStyle || 'all around',
  };

  target.blocks = convertScripts(sb2Obj.scripts || [], allBlocks);
  return target;
}

async function convertSb2ToSb3(inputPath, outputPath) {
  const inputData = fs.readFileSync(inputPath);
  const zip = await JSZip.loadAsync(inputData);
  const projectJsonFile = zip.file('project.json');
  if (!projectJsonFile) {
    throw new Error('Could not find project.json inside SB2 archive.');
  }

  const projectJsonText = await projectJsonFile.async('string');
  const sb2Project = JSON.parse(projectJsonText);
  const globalBroadcasts = convertBroadcasts(sb2Project.broadcasts);
  const targets = [];

  if (Array.isArray(sb2Project.children)) {
    for (const child of sb2Project.children) {
      targets.push(convertTarget(child, globalBroadcasts));
    }
  } else {
    targets.push(convertTarget(sb2Project, globalBroadcasts));
  }

  const sb3Project = {
    targets,
    meta: {
      semver: '3.0.0',
      vm: '0.2.0',
      agent: 'SB2-to-SB3 Converter',
    },
    extensions: [],
  };

  const outputZip = new JSZip();
  outputZip.file('project.json', JSON.stringify(sb3Project, null, 2));

  zip.forEach((relativePath, file) => {
    if (relativePath === 'project.json') return;
    outputZip.file(relativePath, file.async('nodebuffer'));
  });

  const outputData = await outputZip.generateAsync({type: 'nodebuffer'});
  fs.writeFileSync(outputPath, outputData);
}

async function main() {
  const [,, inputPath, outputPathArg] = process.argv;
  if (!inputPath) {
    console.error('Usage: node index.js input.sb2 [output.sb3]');
    process.exit(1);
  }

  const resolvedInput = path.resolve(inputPath);
  const resolvedOutput = path.resolve(outputPathArg || resolvedInput.replace(/\.sb2$/i, '.sb3'));

  try {
    await convertSb2ToSb3(resolvedInput, resolvedOutput);
    console.log(`Converted SB2 -> SB3: ${resolvedOutput}`);
  } catch (error) {
    console.error('Conversion failed:', error.message || error);
    process.exit(1);
  }
}

main();
 
