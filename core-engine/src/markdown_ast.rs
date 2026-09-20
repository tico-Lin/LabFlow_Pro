use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarkdownAst {
    pub content: String,
}

pub fn validate_latex(input: &str) -> Result<(), String> {
    let mut in_inline_math = false;
    let mut in_block_math = false;
    let mut chars = input.chars().peekable();
    
    let mut block_envs: Vec<String> = Vec::new();

    while let Some(c) = chars.next() {
        if c == '$' {
            if let Some(&'$') = chars.peek() {
                // $$ block math
                chars.next();
                in_block_math = !in_block_math;
            } else {
                // $ inline math
                in_inline_math = !in_inline_math;
            }
        } else if c == '\\' {
            let mut cmd = String::new();
            while let Some(&next_c) = chars.peek() {
                if next_c.is_alphabetic() {
                    cmd.push(chars.next().unwrap());
                } else {
                    break;
                }
            }
            if cmd == "begin" {
                if chars.next() == Some('{') {
                    let mut env = String::new();
                    while let Some(env_c) = chars.next() {
                        if env_c == '}' { break; }
                        env.push(env_c);
                    }
                    block_envs.push(env);
                }
            } else if cmd == "end" {
                if chars.next() == Some('{') {
                    let mut env = String::new();
                    while let Some(env_c) = chars.next() {
                        if env_c == '}' { break; }
                        env.push(env_c);
                    }
                    if let Some(last_env) = block_envs.pop() {
                        if last_env != env {
                            return Err(format!("LaTeX syntax error: mismatched environment. Expected \\end{{{}}}, found \\end{{{}}}", last_env, env));
                        }
                    } else {
                        return Err(format!("LaTeX syntax error: \\end{{{}}} without matching \\begin", env));
                    }
                }
            }
        }
    }

    if in_inline_math {
        return Err("LaTeX syntax error: unclosed inline math ($)".to_string());
    }
    if in_block_math {
        return Err("LaTeX syntax error: unclosed block math ($$)".to_string());
    }
    if !block_envs.is_empty() {
        return Err(format!("LaTeX syntax error: unclosed environment \\begin{{{}}}", block_envs.last().unwrap()));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_latex() {
        assert!(validate_latex("Here is some math: $E=mc^2$ and block $$a^2 + b^2 = c^2$$").is_ok());
        assert!(validate_latex("\\begin{equation} x = 1 \\end{equation}").is_ok());
    }

    #[test]
    fn test_invalid_latex_unclosed_inline() {
        let err = validate_latex("This is $ unclosed").unwrap_err();
        assert_eq!(err, "LaTeX syntax error: unclosed inline math ($)");
    }

    #[test]
    fn test_invalid_latex_mismatched_env() {
        let err = validate_latex("\\begin{equation} x = 1 \\end{matrix}").unwrap_err();
        assert_eq!(err, "LaTeX syntax error: mismatched environment. Expected \\end{equation}, found \\end{matrix}");
    }

    #[test]
    fn test_invalid_latex_unclosed_env() {
        let err = validate_latex("\\begin{align} x = 1").unwrap_err();
        assert_eq!(err, "LaTeX syntax error: unclosed environment \\begin{align}");
    }
}

