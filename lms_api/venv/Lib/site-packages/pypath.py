import os.path
import shutil
from glob import glob

class Path(object):

    def __init__(self, path):
        self.strpath = os.path.abspath(str(path))

    def __str__(self):
        return self.strpath

    def __repr__(self):
        return 'Path(%r)' % self.strpath

    def __eq__(self, other):
        if isinstance(other, Path):
            return self.strpath == other.strpath
        elif isinstance(other, basestring):
            return self.strpath == other
        return False

    def __ne__(self, other):
        return not self == other

    @property
    def basename(self):
        return os.path.basename(self.strpath)

    def dirpath(self):
        return self.__class__(os.path.dirname(self.strpath))

    def join(self, *parts):
        parts = map(str, parts)
        return self.__class__(os.path.join(self.strpath, *parts))

    def listdir(self, pattern='*'):
        pattern = os.path.join(self.strpath, pattern)
        return map(self.__class__, glob(pattern))
            
    def write(self, s):
        with open(self.strpath, 'w') as f:
            f.write(s)

    def read(self):
        with open(self.strpath) as f:
            return f.read()

    def ensure(self, dir=False, file=False):
        assert dir, 'Only dir=True is supported for now'
        if not os.path.isdir(self.strpath):
            os.mkdir(self.strpath)
        return self

    def copy(self, dst):
        shutil.copy(self.strpath, str(dst))
