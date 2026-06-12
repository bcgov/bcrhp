export const formatPid = function (pid: number) {
    return pid?.toString()?.padStart(9, '0')?.match(/.{3}/g)?.join('-') || null;
};
