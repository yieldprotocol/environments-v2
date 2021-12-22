import { exec as exec_async, ExecException, ExecOptions } from "child_process";
import { promisify } from "util";

const exec = promisify(exec_async);

/**
 * A thin wrapper around child_process::exec: execute a command, return stdout/stderr/error
 * As a convenience, automatically sets encoding to utf-8
 */
export async function execute(command: string,
    options?: ExecOptions,
    callback?: (error: ExecException | null, stdout: Buffer, stderr: Buffer) => void
): Promise<{ stdout: string, stderr: string, error?: any }> {
    try {
        const results = await exec(command, {
            encoding: "utf-8",
            ...options
        }
        )
        return { stdout: results.stdout, stderr: results.stderr }
    } catch (x) {
        return { stdout: (x as any).stdout, stderr: (x as any).stderr, error: x };
    }
}
