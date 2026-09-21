use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AstNode {
    Text { content: String },
    InlineMath { expression: String },
    BlockMath { expression: String },
    Chemical { format: String, payload: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarkdownAst {
    pub nodes: Vec<AstNode>,
}

pub fn parse_extended_markdown(input: &str) -> Result<MarkdownAst, String> {
    let mut nodes = Vec::new();
    let mut current_text = String::new();
    let mut chars = input.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '$' {
            if let Some(&'$') = chars.peek() {
                chars.next(); 
                if !current_text.is_empty() {
                    nodes.push(AstNode::Text { content: current_text.clone() });
                    current_text.clear();
                }
                let mut expr = String::new();
                while let Some(mc) = chars.next() {
                    if mc == '$' {
                        if chars.peek() == Some(&'$') {
                            chars.next();
                            break;
                        } else {
                            expr.push(mc);
                        }
                    } else {
                        expr.push(mc);
                    }
                }
                nodes.push(AstNode::BlockMath { expression: expr });
            } else {
                if !current_text.is_empty() {
                    nodes.push(AstNode::Text { content: current_text.clone() });
                    current_text.clear();
                }
                let mut expr = String::new();
                while let Some(mc) = chars.next() {
                    if mc == '$' {
                        break;
                    } else {
                        expr.push(mc);
                    }
                }
                nodes.push(AstNode::InlineMath { expression: expr });
            }
        } else if c == '\\' {
            let mut is_cmd = false;
            let mut cmd = String::new();
            let mut peek_chars = chars.clone();
            while let Some(pc) = peek_chars.next() {
                if pc.is_alphabetic() {
                    cmd.push(pc);
                } else if pc == '{' {
                    is_cmd = true;
                    break;
                } else {
                    break;
                }
            }

            if is_cmd && cmd == "smiles" {
                if !current_text.is_empty() {
                    nodes.push(AstNode::Text { content: current_text.clone() });
                    current_text.clear();
                }
                for _ in 0..cmd.len() { chars.next(); }
                chars.next(); // consume '{'
                let mut payload = String::new();
                while let Some(pc) = chars.next() {
                    if pc == '}' { break; }
                    payload.push(pc);
                }
                nodes.push(AstNode::Chemical { format: "SMILES".to_string(), payload });
            } else {
                current_text.push(c);
            }
        } else {
            current_text.push(c);
        }
    }

    if !current_text.is_empty() {
        nodes.push(AstNode::Text { content: current_text });
    }

    Ok(MarkdownAst { nodes })
}
